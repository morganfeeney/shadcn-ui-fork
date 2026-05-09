import React, { PropsWithChildren } from "react"
import { cn } from "@/lib/utils"

export function ContainerInner({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn(className)} {...props}>
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
    <Component className={cn(className)} {...props}>
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
    <ContainerOuter
      data-slot="container-outer"
      component={component}
      className={wrapperClassName}
    >
      <ContainerInner
        data-slot="container-inner"
        className={cn(
          className,
          "relative z-10 mx-auto w-full max-w-500 px-safe"
        )}
      >
        {children}
      </ContainerInner>
    </ContainerOuter>
  )
}
