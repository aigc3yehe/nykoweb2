import React, { useState, useRef } from 'react'
import BgLogo from '../../assets/web2/workflow_setting.svg'
import CoverSelectIcon from '../../assets/web2/cover_select.svg'
import CloseIcon from '../../assets/web2/close.svg'
import PublishIcon from '../../assets/web2/publish.svg'

const PublishSidebar: React.FC = () => {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [cover, setCover] = useState<File | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [nameFocus, setNameFocus] = useState(false)
  const [descFocus, setDescFocus] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCover(e.target.files[0])
      setCoverUrl(URL.createObjectURL(e.target.files[0]))
    }
  }
  const handleRemoveCover = () => {
    setCover(null)
    setCoverUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <aside className="w-[19.375rem] flex flex-col justify-between p-6 border-r relative overflow-hidden" style={{ borderColor: '#F3F4F6', background: '#fff' }}>
      {/* 底部背景logo */}
      <img src={BgLogo} alt="bg-logo" className="absolute left-0 bottom-0 w-[13.125rem] h-[18.9375rem] pointer-events-none select-none" style={{zIndex:0}} />
      {/* 信息区 */}
      <div className="flex flex-col gap-6 relative z-10 w-full">
        {/* Workflow Name */}
        <div className="flex flex-col gap-2 w-full">
          <span className="font-lexend font-semibold text-[1.5rem] leading-[100%] text-[#1F2937]">Workflow</span>
          <input
            className={`w-full border rounded-[0.625rem] px-3 py-3 text-[#1F2937] font-lexend text-base outline-none transition-colors ${nameFocus ? 'border-[#0900FF]' : 'border-[#E5E7EB]'}`}
            placeholder="name"
            value={name}
            onChange={e => setName(e.target.value)}
            onFocus={() => setNameFocus(true)}
            onBlur={() => setNameFocus(false)}
            style={{ fontSize: '1rem' }}
          />
        </div>
        {/* Description */}
        <div className="flex flex-col gap-2 w-full">
          <span className="font-lexend font-normal text-sm leading-[100%] text-[#1F2937]">Description</span>
          <textarea
            className={`w-full h-[7.5rem] border rounded-[0.625rem] px-3 py-3 text-[#1F2937] font-lexend text-base outline-none resize-none transition-colors ${descFocus ? 'border-[#0900FF]' : 'border-[#E5E7EB]'}`}
            placeholder="Descript your Workflow"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            onFocus={() => setDescFocus(true)}
            onBlur={() => setDescFocus(false)}
            style={{ fontSize: '1rem' }}
          />
        </div>
        {/* Cover Image */}
        <div className="flex flex-col gap-2 w-full">
          <span className="font-lexend font-normal text-sm leading-[100%] text-[#1F2937]">Cover Image</span>
          {cover && coverUrl ? (
            <div className="relative w-full">
              <img
                src={coverUrl}
                alt="cover"
                className="w-full rounded-[0.625rem] object-cover"
              />
              <button
                type="button"
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-white bg-opacity-80 rounded-full hover:bg-gray-100"
                onClick={handleRemoveCover}
              >
                <img src={CloseIcon} alt="Remove" className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="w-full h-[7.9375rem] border border-dashed border-[#E5E7EB] rounded-[0.625rem] flex flex-col items-center justify-center gap-1.5 px-6 py-10 relative hover:border-[#0900FF] transition-colors"
              style={{ borderWidth: '1px', borderStyle: 'dashed', borderRadius: '0.625rem' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <img src={CoverSelectIcon} alt="select" className="w-8 h-[1.9375rem] mb-2" />
              <span className="font-lexend font-normal text-xs leading-[100%] text-[#9CA3AF] text-center">Click to upload Or drag here</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
            </button>
          )}
        </div>
      </div>
      {/* 下方内容：Publish按钮 */}
      <div className="relative z-10 mt-6">
        <button
          className="w-full flex items-center justify-center gap-1.5 rounded-[6px] py-3 bg-[#0900FF] hover:bg-blue-800 transition-colors"
        >
          <img src={PublishIcon} alt="Publish" className="w-5 h-5" style={{ width: '1.25rem', height: '1.25rem' }} />
          <span className="font-lexend font-normal text-lg leading-[100%] text-white" style={{ fontSize: '1.125rem' }}>
            Publish
          </span>
        </button>
      </div>
    </aside>
  )
}

export default PublishSidebar 