import Image from "next/image"
import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "./login-form"

export function Login02Demo() {
  return (
    <div className="grid min-h-svh bg-background text-foreground lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden min-h-[320px] bg-muted lg:block">
        <div className="absolute inset-0 z-30 bg-primary opacity-50 mix-blend-color" />
        <Image
          fill
          src="https://images.unsplash.com/photo-1569605803663-e9337d901ff9?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt=""
          className="relative z-20 w-full object-cover brightness-50 invert dark:brightness-60 dark:grayscale dark:invert-0"
          sizes="(min-width: 1024px) 50vw, 0"
        />
      </div>
    </div>
  )
}
