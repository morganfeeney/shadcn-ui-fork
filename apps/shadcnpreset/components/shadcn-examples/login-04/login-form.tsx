import type { ComponentProps } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/cn-ui/button"
import { Card, CardContent } from "@/components/cn-ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/cn-ui/input"

export function LoginForm({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="cn-dialog-title">Welcome back</h1>
                <p className="cn-dialog-description">
                  Login to your Acme Inc account
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" required />
              </Field>
              <Field>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field className="grid grid-cols-3 gap-4">
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>Apple</title>
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.615-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with Apple</span>
                </Button>
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>Google</title>
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.13-1.373 1.373-3.507 2.87-7.053 2.87-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72  8.6-8.72c2.6 0 4.507 1.027 5.96 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with Google</span>
                </Button>
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>Meta</title>
                    <path
                      d="M6.915 4.03c-1.867 0-3.488 1.355-3.488 3.945 0-1.602.34-3.074 1.667-4.093C3.386 5.693 2.366 7.84 2.366 10 2.37 12.76 4.44 15.19 7.08 15.76c-.387-1.973-1.053-3.78-1.667-5.647-.337-1.007-.78-2.126-.353-3.187.427-1.06 1.757-1.314 2.8-.967 2.78.91 3.62 3.55 4.22 5.957 1.08-.44 2.093-1.027 3.027-1.72.63-.517 1.254-1.254 1.967-1.627-.66 1.85-1.253 3.707-1.92 5.56 1.52-.09 3.027-.293 4.507-.58-.093 1.527-1.04 2.853-2.167 3.827 1.213-.287 2.4-.66 3.573-1.093-.42 1.24-1.093 2.4-2.027 3.373C15.99 21.832 12.34 22.27 8.74 21.98c-2.848-.242-5.543-1.567-7.667-3.6 2.02-1.813 4.093-3.546 6.14-5.293-.513 1.413-1.093 2.813-1.5 4.307 1.153-.513 2.313-1.013 3.44-1.6.96-1.227 1.813-2.547 2.613-3.907-1.927-.3-3.853-.56-5.773-.86-1.073-.093-2.213-.227-3.027-.953"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with Meta</span>
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Don&apos;t have an account? <a href="#">Sign up</a>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden min-h-80 bg-muted md:block">
            <div className="absolute inset-0 z-30 bg-primary opacity-50 mix-blend-color" />
            <Image
              fill
              src="https://images.unsplash.com/photo-1569605803663-e9337d901ff9?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt=""
              className="relative z-20 w-full object-cover brightness-60 grayscale"
              sizes="(min-width: 768px) 50vw, 0"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
