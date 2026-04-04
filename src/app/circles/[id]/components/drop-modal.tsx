'use client'

import { useState, useRef } from 'react'
import { postDrop } from '@/app/drops/actions'
import { createClient } from '@/utils/supabase/client'

const DROP_TYPES = ['Meme', 'Thought', 'Question', 'Challenge', 'Video']

export function DropModal({ circleId }: { circleId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState('Meme')
  const [file, setFile] = useState<File | null>(null)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    let mediaUrl = ''

    // 1. Handle File Upload if Meme or Video
    if (file && (type === 'Meme' || type === 'Video')) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${circleId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('drops-media')
        .upload(filePath, file)

      if (uploadError) {
        alert('Upload failed: ' + uploadError.message)
        setLoading(false)
        return
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('drops-media')
        .getPublicUrl(filePath)
      
      mediaUrl = publicUrl
    }

    formData.set('circleId', circleId)
    formData.set('type', type)
    formData.set('isAnonymous', isAnonymous.toString())
    if (mediaUrl) formData.set('mediaUrl', mediaUrl)

    const result = await postDrop(formData)
    if (result.success) {
      setOpen(false)
      window.location.reload()
    } else {
      alert(result.error)
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button 
        onClick={() => setOpen(true)}
        className="btn-primary !bg-gold !text-bg-primary !px-8 py-2 font-bold shadow-[0_0_30px_rgba(201,169,110,0.1)] shrink-0"
      >
        Post a Drop
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-bg-primary/95 backdrop-blur-md selection:bg-gold selection:text-bg-primary overflow-y-auto">
      <div className="w-full max-w-2xl bg-bg-surface border border-border-custom p-8 md:p-12 space-y-12 animate-fade-in enter my-auto">
        <header className="flex justify-between items-start">
           <div className="space-y-2">
              <p className="label text-gold">TRANSMISSION PROTOCOL</p>
              <h2 className="heading-md uppercase">Draft New Drop</h2>
           </div>
           <button onClick={() => setOpen(false)} className="text-text-tertiary hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
           </button>
        </header>

        <form action={handleSubmit} className="space-y-12">
          {/* Step 1: Type Selection */}
          <div className="space-y-4">
            <p className="label !text-text-tertiary">Select Format</p>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-px bg-border-custom border border-border-custom p-px">
               {DROP_TYPES.map(t => (
                 <button 
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t)
                    setFile(null)
                  }}
                  className={`py-4 text-[10px] uppercase tracking-widest font-ibm transition-all duration-300 ${type === t ? 'bg-gold text-bg-primary' : 'bg-bg-primary text-text-secondary hover:text-white'}`}
                 >
                   {t}
                 </button>
               ))}
            </div>
          </div>

          {/* Step 2: Content Input */}
          <div className="space-y-8">
             {(type === 'Meme' || type === 'Video') && (
               <div className="space-y-4">
                 <p className="label !text-text-tertiary">{type} Media</p>
                 <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video border-2 border-dashed border-border-custom flex items-center justify-center cursor-pointer hover:border-gold/30 transition-colors group relative overflow-hidden bg-bg-primary"
                 >
                   {file ? (
                     <div className="text-center space-y-2">
                        <p className="body-sm text-gold uppercase">{file.name}</p>
                        <p className="text-[10px] label">CLICK TO CHANGE</p>
                     </div>
                   ) : (
                     <div className="text-center space-y-4">
                        <svg className="mx-auto text-text-tertiary group-hover:text-gold transition-colors" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        <p className="label !text-text-tertiary">Upload {type} (MAX {type === 'Video' ? '50MB' : '10MB'})</p>
                     </div>
                   )}
                   <input 
                    ref={fileInputRef}
                    type="file" 
                    hidden 
                    accept={type === 'Video' ? 'video/*' : 'image/*'}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                   />
                 </div>
               </div>
             )}

             <div className="space-y-4">
                <p className="label !text-text-tertiary">{type === 'Thought' || type === 'Question' ? 'Message' : 'Caption (Optional)'}</p>
                <textarea 
                  name="content"
                  required={type === 'Thought' || type === 'Question'}
                  className="w-full h-24 bg-transparent border-none border-b border-border-custom text-text-primary text-sm outline-none focus:border-gold transition-colors resize-none !p-0"
                  placeholder="Insert transmission..."
                />
             </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-border-custom/30">
             <div className="flex items-center gap-6">
                <div 
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className={`w-5 h-5 border flex items-center justify-center transition-all duration-300 ${isAnonymous ? 'border-gold bg-gold text-bg-primary' : 'border-border-custom group-hover:border-gold'}`}>
                    {isAnonymous && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                  </div>
                  <span className={`label transition-colors ${isAnonymous ? 'text-gold' : 'text-text-tertiary group-hover:text-text-secondary'}`}>POST ANONYMOUSLY</span>
                </div>
                <span className="text-[9px] label opacity-20 tracking-tighter">USES 1 OF 3 WEEKLY ANON DROPS</span>
             </div>

             <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary px-12 py-4 w-full md:w-auto"
             >
               {loading ? 'PROCESSING...' : 'Transmit Drop'}
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}
