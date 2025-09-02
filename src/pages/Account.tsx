import React from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { userStateAtom, logoutAtom, fetchUserPlanAtom } from '../store/loginStore'
import { useLang, withLangPrefix } from '../hooks/useLang'
import ThemeAdaptiveIcon from '../components/ui/ThemeAdaptiveIcon'
import FreeIcon from '../assets/mavae/vip/free.svg'
import FreeIconDark from '../assets/mavae/dark/vip/free.svg'
import ProIcon from '../assets/mavae/vip/pro.svg'
import ProIconDark from '../assets/mavae/dark/vip/pro.svg'
import PlusIcon from '../assets/mavae/vip/plus.svg'
import PlusIconDark from '../assets/mavae/dark/vip/plus.svg'
import { paymentService } from '../services/paymentService'

const Account: React.FC = () => {
    const navigate = useNavigate()
    const lang = useLang()
    const [userState] = useAtom(userStateAtom)
    const logout = useSetAtom(logoutAtom)
    const fetchUserPlan = useSetAtom(fetchUserPlanAtom)

    // 当用户登录后，获取用户计划状态
    React.useEffect(() => {
        if (userState.isAuthenticated && userState.user && !userState.userPlan) {
            fetchUserPlan()
        }
    }, [userState.isAuthenticated, userState.user, userState.userPlan, fetchUserPlan])

    // 获取会员等级图标
    const getMembershipIcon = () => {
        if (!userState.userPlan) {
            return { light: FreeIcon, dark: FreeIconDark } // 默认使用Free图标
        }

        switch (userState.userPlan.plan_type) {
            case 'premium':
                return { light: ProIcon, dark: ProIconDark }
            case 'pro':
                return { light: PlusIcon, dark: PlusIconDark }
            case 'free':
            default:
                return { light: FreeIcon, dark: FreeIconDark }
        }
    }

    // 获取当前计划名称
    const getCurrentPlan = () => {
        if (!userState.userPlan) {
            return 'Free'
        }

        switch (userState.userPlan.plan_type) {
            case 'premium':
                return 'Premium'
            case 'pro':
                return 'Pro'
            case 'free':
            default:
                return 'Free'
        }
    }

    // 获取计划总积分
    const getPlanTotalCredits = () => {
        if (!userState.userPlan) {
            return 0 // Free套餐
        }

        switch (userState.userPlan.plan_type) {
            case 'premium':
                return 8000 // Pro套餐
            case 'pro':
                return 1000 // Plus套餐
            case 'free':
            default:
                return 0 // Free套餐
        }
    }

    // 计算积分使用百分比
    const calculateCreditUsage = () => {
        const totalCredits = getPlanTotalCredits()
        if (totalCredits === 0) {
            return 0 // Free套餐无额度
        }

        const usedCredits = totalCredits - (userState.userPlan?.sub_balance || 0)
        return Math.round((usedCredits / totalCredits) * 100)
    }

    // 获取使用进度提示文本
    const getUsageProgressText = () => {
        if (!userState.userPlan) {
            return "You have no Mavae credits this month" // Free套餐
        }

        switch (userState.userPlan.plan_type) {
            case 'premium':
                return `Your Mavae credit for this month has already reached ${calculateCreditUsage()}% usage`
            case 'pro':
                return `Your Mavae credit for this month has already reached ${calculateCreditUsage()}% usage`
            case 'free':
            default:
                return "You have no Mavae credits this month"
        }
    }

    // 处理退出登录
    const handleLogout = () => {
        logout()
        navigate(withLangPrefix(lang, '/'))
    }

    // 处理管理订阅
    const handleManageSubscription = async () => {
        if (!userState.user) return
        
        try {
            await paymentService.manageSubscription(userState.user.tokens.did)
        } catch (error) {
            console.error('Failed to manage subscription:', error)
            // 这里可以添加错误提示，比如使用toast
        }
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
    const usageProgressText = getUsageProgressText()

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
                            <ThemeAdaptiveIcon
                                lightIcon={getMembershipIcon().light}
                                darkIcon={getMembershipIcon().dark}
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
                        {/* 管理订阅按钮 - 只在非免费套餐时显示 */}
                        {userState.userPlan && userState.userPlan.plan_type !== 'free' && (
                            <button
                                onClick={handleManageSubscription}
                                className="font-switzer font-medium text-sm leading-6 text-[#4458FF] hover:text-[#3A49D6] transition-colors"
                            >
                                Manage Subscription
                            </button>
                        )}
                    </div>
                </div>

                {/* 计划余额信息 */}
                {userState.userPlan && (
                    <>
                        {/* 订阅余额 */}
                        <div className="flex flex-col gap-1">
                            <span className="font-switzer font-medium text-sm leading-5 text-text-secondary dark:text-text-secondary-dark">
                                Subscription Balance
                            </span>
                            <span className="font-switzer font-bold text-base leading-6 text-text-main dark:text-text-main-dark">
                                {userState.userPlan.sub_balance || 0} credits
                            </span>
                        </div>

                        {/* 付费余额 */}
                        <div className="flex flex-col gap-1">
                            <span className="font-switzer font-medium text-sm leading-5 text-text-secondary dark:text-text-secondary-dark">
                                Paid Balance
                            </span>
                            <span className="font-switzer font-bold text-base leading-6 text-text-main dark:text-text-main-dark">
                                {userState.userPlan.paid_balance || 0} credits
                            </span>
                        </div>

                        {/* 下次刷新时间 */}
                        {userState.userPlan.next_refresh_at && (
                            <div className="flex flex-col gap-1">
                                <span className="font-switzer font-medium text-sm leading-5 text-text-secondary dark:text-text-secondary-dark">
                                    Next Refresh
                                </span>
                                <span className="font-switzer font-bold text-base leading-6 text-text-main dark:text-text-main-dark">
                                    {new Date(userState.userPlan.next_refresh_at).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </>
                )}
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
                        {userState.userPlan?.sub_balance || 0}
                    </span>
                </div>

                {/* 使用进度 */}
                <div className="flex flex-col gap-1">
                    <span className="font-switzer font-medium text-sm leading-5 text-text-secondary dark:text-text-secondary-dark">
                        {usageProgressText}
                    </span>
                    {/* 进度条 - 只在有额度的套餐下显示 */}
                    {getPlanTotalCredits() > 0 && (
                        <div className="w-full h-6 rounded-xl bg-[#84CC161A] overflow-hidden">
                            <div
                                className="h-6 rounded-xl bg-[#84CC16] transition-all duration-300"
                                style={{ width: `${creditUsage}%` }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Account
