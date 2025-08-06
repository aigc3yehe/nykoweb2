import React, { useRef } from 'react'
import { useAtom } from 'jotai'
import CheckIcon from '../assets/web2/check.svg'
import UploadSmallIcon from '../assets/web2/upload_small.svg'
import RemoveAllIcon from '../assets/web2/remove_all.svg'
import AddImageIcon from '../assets/web2/add_image.svg'
import RemoveIcon from '../assets/web2/remove.svg'

import {
  styleTrainerFormAtom,
  imageUploadStateAtom,
  uploadImagesAtom,
  removeImageAtom,
  removeAllImagesAtom,
  styleTrainerStatusAtom
} from '../store/styleTrainerStore'

const MAX_IMAGES = 30

const StyleTrainer: React.FC = () => {
  const [formData] = useAtom(styleTrainerFormAtom)
  const [imageUploadState] = useAtom(imageUploadStateAtom)
  const [status] = useAtom(styleTrainerStatusAtom)
  const [, uploadImages] = useAtom(uploadImagesAtom)
  const [, removeImage] = useAtom(removeImageAtom)
  const [, removeAllImages] = useAtom(removeAllImagesAtom)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 上传图片到S3
  const handleRefImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).slice(0, MAX_IMAGES - formData.referenceImages.length)
      try {
        await uploadImages(files)
      } catch (err) {
        console.error('Upload failed:', err)
      }
    }
  }

  // 移除所有图片
  const handleRemoveAll = () => {
    removeAllImages()
  }

  // 移除单张图片
  const handleRemoveOne = (imageUrl: string) => {
    removeImage(imageUrl)
  }

  // 上传中蒙版 - 只遮住主内容区域
  const renderUploadingMask = () => {
    const totalToUpload = imageUploadState.totalFilesToUpload
    const currentIndex = imageUploadState.currentUploadIndex
    
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center" style={{background: '#FFFFFFB2', backdropFilter: 'blur(20px)'}}>
        <div className="flex flex-col items-center w-[27.375rem] h-[3.125rem] gap-5">
          <span className="font-lexend font-normal text-2xl leading-[100%] text-[#1F2937]">Uploading {currentIndex}/{totalToUpload}</span>
          <div className="w-[27.375rem] h-1.5 rounded-[1.875rem] bg-[#E5E7EB] overflow-hidden">
            <div className="h-full rounded-[1.875rem] bg-[#0900FF] transition-all" style={{width: `${status.uploadProgress}%`}}></div>
          </div>
        </div>
      </div>
    )
  }

  // 上传成功后的内容 - 在主内容区域显示
  const renderUploadedContent = () => (
    <div className="flex w-full flex-col gap-6 p-6 pb-24 lg:pb-6">
      {/* Heading 区域 */}
      <div className="flex flex-col md:flex-row gap-4 items-center md:justify-between md:h-8">
        <div className="flex items-center gap-2.5 h-6">
          <span className="font-lexend font-semibold text-2xl leading-[100%] text-[#1F2937]">Image Uploaded</span>
          <span className="font-lexend font-normal text-sm leading-[100%] text-[#4B5563]">({formData.referenceImages.length})</span>
        </div>
        <div className="flex items-center gap-2 h-8">
          <button className="flex items-center gap-1 h-8 rounded-[0.375rem] px-3 bg-white border border-[#E5E7EB] hover:bg-gray-50 transition-colors" onClick={handleRemoveAll}>
            <img src={RemoveAllIcon} alt="remove all" className="w-4 h-4" />
            <span className="font-lexend font-normal text-sm text-[#4B5563]">Remove All</span>
          </button>
          <button className="flex items-center gap-1 h-8 rounded-[0.375rem] px-3 bg-white border border-[#E5E7EB] hover:bg-gray-50 transition-colors" onClick={() => fileInputRef.current?.click()}>
            <img src={AddImageIcon} alt="add image" className="w-4 h-4" />
            <span className="font-lexend font-normal text-sm text-[#4B5563]">Add Image</span>
          </button>
        </div>
      </div>
      {/* 图片集展示区域 */}
      <div className="grid grid-cols-2 gap-5 lg:flex lg:flex-wrap">
        {formData.referenceImages.map((url) => (
          <div key={url} className="relative w-full aspect-square rounded-xl bg-[#E8E8E8] overflow-hidden group lg:w-[8.5625rem] lg:h-[8.5625rem]">
            <img src={url} alt="uploaded" className="w-full h-full object-cover rounded-xl" />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-1">
              <button className="w-6 h-6 flex items-center justify-center" onClick={() => handleRemoveOne(url)}>
                <img src={RemoveIcon} alt="remove" className="w-6 h-6" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // 上传为空时的界面
  const renderEmptyUploadContent = () => (
    <div className="w-full flex flex-col items-center gap-8">
      {/* 第一个区域：三张图片 */}
      <div className="w-[22.375rem] h-[10.9375rem] relative">
        {/* 第一张图片 */}
        <div className="absolute w-[6.625rem] h-[8.875rem] top-[1.6875rem] left-[0.375rem] rounded-xl bg-[#E8E8E8] border-[0.375rem] border-white">
          <img src="/upload1.png" alt="upload1" className="w-full h-full object-cover rounded-lg" />
        </div>
        {/* 第二张图片 - 层级最高 */}
        <div className="absolute w-[8.5625rem] h-[10.1875rem] top-[0.375rem] left-[6.875rem] rounded-xl  bg-[#E8E8E8] border-[0.375rem] border-white z-10">
          <img src="/upload2.png" alt="upload2" className="w-full h-full object-cover rounded-lg" />
        </div>
        {/* 第三张图片 */}
        <div className="absolute w-[6.625rem] h-[8.875rem] top-[1.6875rem] left-[15.375rem] rounded-xl bg-[#E8E8E8] border-[0.375rem] border-white">
          <img src="/upload3.png" alt="upload3" className="w-full h-full object-cover rounded-lg" />
        </div>
      </div>

      {/* 第二个区域：文本提示 */}
      <div className="flex flex-col items-center gap-[0.875rem]">
        {/* 第一行文本 */}
        <div className="text-center px-5 md:px-0">
          <span className="font-lexend font-semibold text-2xl leading-[100%] text-[#1F2937]">
            Upload 10 more images to build Your style
          </span>
        </div>
        {/* 第二行：提示列表 - 移动端一行一个 */}
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-4">
          <div className="flex items-center gap-[0.375rem] h-5">
            <img src={CheckIcon} alt="check" className="w-4 h-4" />
            <span className="font-lexend font-normal text-sm leading-[140%] text-[#4B5563]">
              Consistent style
            </span>
          </div>
          <div className="flex items-center gap-[0.375rem] h-5">
            <img src={CheckIcon} alt="check" className="w-4 h-4" />
            <span className="font-lexend font-normal text-sm leading-[140%] text-[#4B5563]">
              Distinct features
            </span>
          </div>
          <div className="flex items-center gap-[0.375rem] h-5">
            <img src={CheckIcon} alt="check" className="w-4 h-4" />
            <span className="font-lexend font-normal text-sm leading-[140%] text-[#4B5563]">
              Show diversity
            </span>
          </div>
          <div className="flex items-center gap-[0.375rem] h-5">
            <img src={CheckIcon} alt="check" className="w-4 h-4" />
            <span className="font-lexend font-normal text-sm leading-[140%] text-[#4B5563]">
              Clear & No watermark
            </span>
          </div>
        </div>
      </div>

      {/* 第三个区域：上传按钮 */}
      <div className="flex items-center justify-center">
        <button
          className="h-[2.9375rem] flex items-center gap-[0.375rem] rounded-[0.375rem] px-4 bg-[#00FF48] hover:bg-[#00E644] transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <img src={UploadSmallIcon} alt="upload" className="w-6 h-[1.4375rem]" />
          <span className="font-lexend font-normal text-base leading-[100%] text-black">
            Upload Images
          </span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-full w-full overflow-y-auto">
      {/* 主内容区域 */}
      <div className={`flex-1 flex relative ${formData.referenceImages.length > 0 ? 'md:p-6' : 'items-center justify-center'}`}>
        {/* 根据状态显示不同内容 */}
        {formData.referenceImages.length > 0 ? (
          renderUploadedContent()
        ) : (
          renderEmptyUploadContent()
        )}
        
        {/* 上传中蒙版 - 覆盖在内容之上 */}
        {status.isUploading && renderUploadingMask()}
        
        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleRefImageChange}
        />
      </div>
      

    </div>
  )
}

export default StyleTrainer