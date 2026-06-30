import React, { PropsWithChildren } from "react"
import { cn } from "@/lib/utils"

export function ContainerInner({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="container-inner"
      className={cn(className, "container-inner")}
      {...props}
    >
      {children}
    </div>
  )
}

export function ContainerOuter({
  children,
  className,
  component: Component = "div",
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  component?: React.ElementType
}) {
  return (
    <Component data-slot="container-outer" className={cn(className)} {...props}>
      {children}
    </Component>
  )
}

interface ContainerProps extends PropsWithChildren {
  className?: string
  component?: React.ElementType
  wrapperClassName?: string
}

export function Container({
  className,
  component,
  children,
  wrapperClassName,
}: ContainerProps) {
  return (
    <ContainerOuter component={component} className={wrapperClassName}>
      <ContainerInner className={cn(className)}>{children}</ContainerInner>
    </ContainerOuter>
  )
}
