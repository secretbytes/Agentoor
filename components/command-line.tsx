"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ImageIcon, Send, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"


export const templates = [
  { id: 1, text: "Swap 0.01 sol to usdc" },
  { id: 2, text: "Add liquidity to sol-usdc" },
  { id: 6, text: "stake sol" },
  { id: 3, text: "Remove liquidity" },
  { id: 4, text: "Show my active positions" },
  { id: 5, text: "Show liquidity pair pools for sol-usdc" },
]



interface CommandLineProps {
  prompt?: string
  value?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
  onFileUpload?: () => void
}

export function CommandLine({
  prompt = "~test-project$",
  value = "",
  onChange,
  onSubmit,
  onFileUpload,
}: CommandLineProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleTemplateClick = (template: string) => {
    onChange?.(template)
    setIsOpen(false)
  }

  return (
    <motion.div>
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Select a Template</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {templates.map((template) => (
                    <Button
                      key={template.id}
                      variant="ghost"
                      className="justify-start text-left"
                      onClick={() => handleTemplateClick(template.text)}
                    >
                      {template.text}
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </TooltipTrigger>
          <TooltipContent>
            <p>Choose a template</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={onFileUpload}>
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
    <motion.div
        className="text-xs text-gray-500 text-center mt-2 font-mono italic"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        This is a beta version of SuperAgents and can make mistakes.
      </motion.div>
    </motion.div>
  )
}

