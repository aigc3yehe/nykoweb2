import React from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { userStateAtom, logoutAtom } from '../store/loginStore'
import { useLang, withLangPrefix } from '../hooks/useLang'
import FreeIcon from '../assets/mavae/free.svg'
//import PlusIcon from '../assets/mavae/plus.svg'
//import ProIcon from '../assets/mavae/pro.svg'

const Account: React.FC = () => {
    const navigate = useNavigate()
    const lang = useLang()
    const [userState] = useAtom(userStateAtom)
    const logout = useSetAtom(logoutAtom)

    // 获取会员等级图标
    const getMembershipIcon = () => {
        // TODO: 从用户信息中获取实际会员等级
        // 目前默认使用Free
        return FreeIcon
    }

    // 获取当前计划名称
    const getCurrentPlan = () => {
        // TODO: 从用户信息中获取实际计划
        return 'Free'
    }

    // 计算积分使用百分比
    const calculateCreditUsage = () => {
        const totalCredits = 100 // TODO: 从用户信息中获取总积分
        const usedCredits = totalCredits - (userState.userDetails?.credit || 0)
        return Math.round((usedCredits / totalCredits) * 100)
    }

    // 处理退出登录
    const handleLogout = () => {
        logout()
        navigate(withLangPrefix(lang, '/'))
    }

    if (!userState.isAuthenticated || !userState.user) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Please log in to view your account
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        You need to be logged in to access this page.
                    </p>
                </div>
            </div>
        )
    }

    const { user } = userState
    const creditUsage = calculateCreditUsage()

    return (
        <div className="w-full px-4 md:px-8 pb-8 flex flex-col gap-4 md:gap-6">
            {/* 移动端标题 */}
            <h1 className="md:hidden h-16 py-4 font-switzer font-bold text-2xl leading-8 text-text-main dark:text-text-main-dark">
                Account
            </h1>

            {/* 第一个模块：用户信息 */}
            <div className="w-full border border-line-subtle dark:border-line-subtle-dark rounded-xl p-6 md:p-8 flex justify-between items-center bg-secondary dark:bg-secondary-dark">
                {/* 左侧用户信息 */}
                <div className="flex items-center gap-1">
                    {/* 用户头像 + 等级 */}
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-[#E5E7EB] hover:bg-[#D1D5DB] transition-colors overflow-hidden flex items-center justify-center">
                            {user.picture ? (
                                <img
                                    src={user.picture}
                                    alt={user.name || 'User'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-600 text-lg font-medium">
                                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                            )}
                        </div>
                        {/* 会员等级标识 - 下边居中 */}
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-[3.375rem] h-6">
                            <img
                                src={getMembershipIcon()}
                                alt="Membership"
                                className="w-full h-full"
                            />
                        </div>
                    </div>

                    {/* 用户昵称信息 */}
                    <div className="flex flex-col gap-1">
                        <span className="font-switzer font-medium text-sm leading-5 text-text-secondary dark:text-text-secondary-dark">
                            Handle
                        </span>
                        <span className="font-switzer font-bold text-2xl leading-8 text-text-main dark:text-text-main-dark">
                            {user.name || 'User'}
                        </span>
                    </div>
                </div>

                {/* 右侧退出按钮 */}
                <button
                    onClick={handleLogout}
                    className="h-9 px-4 gap-1 rounded-full bg-[#CA35421F] hover:bg-[#CA354233] transition-colors flex items-center justify-center"
                >
                    <span className="font-switzer font-medium text-sm leading-5 text-[#CA3542] text-center">
                        Log out
                    </span>
                </button>
            </div>

            {/* 第二个模块：账户信息 */}
            <div className="w-full border border-line-subtle dark:border-line-subtle-dark rounded-xl p-6 md:p-8 flex flex-col gap-6 bg-secondary dark:bg-secondary-dark">
                {/* 标题 */}
                <h2 className="font-switzer font-bold text-xl leading-6 text-text-secondary dark:text-text-secondary-dark">
                    Account Info
                </h2>

                {/* 邮箱信息 */}
                <div className="flex flex-col gap-1">
                    <span className="font-switzer font-medium text-sm leading-5 text-text-secondary dark:text-text-secondary-dark">
                        Email
                    </span>
                    <span className="font-switzer font-bold text-base leading-6 text-text-main dark:text-text-main-dark">
                        {user.email}
                    </span>
                </div>

                {/* 当前计划 */}
                <div className="flex flex-col gap-1">
                    <span className="font-switzer font-medium text-sm leading-5 text-text-secondary dark:text-text-secondary-dark">
                        Current Plan
                    </span>
                    <div className="h-6 flex items-center gap-6">
                        <span className="font-switzer font-bold text-base leading-6 text-text-main dark:text-text-main-dark">
                            {getCurrentPlan()}
                        </span>
                        <button
                            onClick={() => navigate(withLangPrefix(lang, '/pricing'))}
                            className="font-switzer font-medium text-sm leading-6 text-[#65A30D] hover:text-[#4D7C0F] transition-colors"
                        >
                            View Plan Details
                        </button>
                    </div>
                </div>
            </div>

            {/* 第三个模块：积分使用情况 */}
            <div className="w-full border border-line-subtle dark:border-line-subtle-dark rounded-xl p-6 md:p-8 flex flex-col gap-6 bg-secondary dark:bg-secondary-dark">
                {/* 标题 */}
                <h2 className="font-switzer font-bold text-xl leading-6 text-text-secondary dark:text-text-secondary-dark">
                    Credit Usage
                </h2>

                {/* 剩余积分 */}
                <div className="flex flex-col gap-1">
                    <span className="font-switzer font-medium text-sm leading-5 text-text-secondary dark:text-text-secondary-dark">
                        Remain credits
                    </span>
                    <span className="font-switzer font-bold text-base leading-6 text-text-main dark:text-text-main-dark">
                        {userState.userDetails?.credit || 0}
                    </span>
                </div>

                {/* 使用进度 */}
                <div className="flex flex-col gap-1">
                    <span className="font-switzer font-medium text-sm leading-5 text-text-secondary dark:text-text-secondary-dark">
                        Your Mavae credit for this month has already reached {creditUsage}% usage
                    </span>
                    {/* 进度条 */}
                    <div className="w-full h-6 rounded-xl bg-[#84CC161A] overflow-hidden">
                        <div
                            className="h-6 rounded-xl bg-[#84CC16] transition-all duration-300"
                            style={{ width: `${creditUsage}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Account
