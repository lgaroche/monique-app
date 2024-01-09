"use client"
import "../styles/globals.css"
import type { AppProps } from "next/app"
import { Flowbite } from "flowbite-react"
import Web3Modal from "../context/Web3Modal"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Flowbite>
      <Web3Modal>
        <Component {...pageProps} />
      </Web3Modal>
    </Flowbite>
  )
}

export default MyApp
