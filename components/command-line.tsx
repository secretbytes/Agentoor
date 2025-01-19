"use client"

import { motion } from "framer-motion"
import { ImageIcon, Send } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface CommandLineProps {
  prompt?: string
  value?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
  onFileUpload?: () => void
}

export function CommandLine({ prompt = "~test-project$", value = "", onChange, onSubmit, onFileUpload }: CommandLineProps) {
  return (
    <motion.div 
      className="flex items-center gap-2 px-4 py-2 bg-[#1C1E21] rounded-lg mx-4 mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className="text-gray-400 font-mono">{prompt}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSubmit?.(value)
          }
        }}
        className="flex-1 bg-transparent border-none outline-none text-white font-mono"
        spellCheck={false}
        autoComplete="off"
        autoFocus
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-gray-400 hover:text-white"
        onClick={onFileUpload}
      >
        <ImageIcon className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-gray-400 hover:text-white"
        onClick={() => onSubmit?.(value)}
      >
        <Send className="h-5 w-5" />
      </Button>
    </motion.div>
  )
}
