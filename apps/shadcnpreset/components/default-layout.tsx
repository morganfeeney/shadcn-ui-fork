import { PropsWithChildren } from "react"
import { Header1 } from "@/components/zippystarter/header1"
import { Footer1 } from "@/components/zippystarter/footer1"
import { ContainerOuter, Container } from "@/components/zippystarter/container"

export function DefaultLayout({ children }: PropsWithChildren) {
  return (
    <>
      <ContainerOuter className="grid min-h-screen grid-rows-[auto_1fr_auto]">
        <Header1 />
        <Container wrapperClassName="grid" className="grid">
          {children}
        </Container>
        <Footer1 />
      </ContainerOuter>
    </>
  )
}
