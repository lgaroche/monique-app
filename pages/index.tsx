"use client";
import type { NextPage } from "next"
import { useCallback, useEffect, useState } from "react"
import { checksumAddress, isAddress } from "viem"
import { WORDS } from "../words"
import ThemeImage from "../components/ThemeImage";
import { TextInput, Button, Card } from "flowbite-react"
import { FaAngleUp, FaAngleDown, FaAngleLeft, FaAngleRight, FaWallet } from "react-icons/fa";
import { useWeb3Modal } from "@web3modal/wagmi/react"
import { useAccount, usePublicClient } from "wagmi"
import { useRouter } from "next/router";
import Link from "next/link";

import LightEnsMark from "./ens_mark_light.svg"
import DarkEnsMark from "./ens_mark_dark.svg"

interface Monic {
  address: `0x${string}`,
  index: number,
  monic: string
}

interface Stats {
  last_block: number,
  unique_addresses: number
}

interface CardState {
  address: string,
  addressValid: boolean,
  words?: string,
  wordsValid: boolean,
  monic?: Monic
}

const Home: NextPage = () => {
  const { query, push } = useRouter()
  const { open } = useWeb3Modal()
  const [FAQOpen, setFAQOpen] = useState<boolean>(false)
  const { address: myAddress } = useAccount()
  const [stats, setStats] = useState<Stats | undefined>()
  const client = usePublicClient()
  const [loading, setLoading] = useState<boolean>(false)
  const [cardState, setCardState] = useState<CardState>({
    address: "",
    addressValid: true,
    words: "",
    wordsValid: true
  })
  const [helper, setHelper] = useState<string>("-")

  const API = process.env.NEXT_PUBLIC_MONIQUE_API ?? "https://api.monique.app"

  const handleWordsChange = useCallback(async (words: string) => {
    setCardState(({ ...state }) => ({ ...state, words }))
    const spacedWords = words.replace("-", " ")
    if (!spacedWords.split(" ").every((word) => WORDS.includes(word.toLowerCase()))) {
      setCardState(({ ...state }) => ({ ...state, wordsValid: false, address: "", monic: undefined }))
      return
    }
    setCardState(({ ...state }) => ({ ...state, wordsValid: true, addressValid: true }))
    try {
      const res = await fetch(`${API}/resolve/${spacedWords.toLowerCase()}`)
      if (res.status !== 200) {
        setCardState(({ ...state }) => ({ ...state, address: "not found", monic: undefined }))
      } else {
        const monic = await res.json() as Monic
        setCardState(({ ...state }) => ({ ...state, address: checksumAddress(monic.address), monic }))
      }
    } catch (e) {
      console.log(e)
    }
  }, [API])

  const handleAddressChange = useCallback(async (address: string, force: boolean) => {
    const fetchAddress = async (address: string) => {
      try {
        const res = await fetch(`${API}/alias/${address}`)
        if (res.status !== 200) {
          setCardState(({ ...state }) => ({ ...state, words: undefined, monic: undefined, addressValid: true }))
        } else {
          const monic = await res.json() as Monic
          setCardState(({ ...state }) => ({ ...state, words: monic.monic, monic, addressValid: true, wordsValid: true }))
        }
      } catch (e) {
        console.error(e)
        setCardState(({ ...state }) => ({ ...state, words: undefined, monic: undefined, addressValid: true }))
      }
    }
    setCardState(({ ...state }) => ({ ...state, address, wordsValid: true }))
    const split = address.split(".")
    if (isAddress(address)) {
      address = checksumAddress(address)
      await fetchAddress(address)
    } else if (address.includes(".") && (split[split.length - 1].length > 0 || force)) {
      let ensAddress = null
      try {
        ensAddress = await client.getEnsAddress({ name: address })
      } catch (e) {
        console.log(e)
      }
      if (ensAddress) {
        await fetchAddress(ensAddress)
      }
    } else {
      setCardState(({ ...state }) => ({ ...state, addressValid: false, words: "", wordsValid: true }))
    }
  }, [API, client])

  const handleRandom = useCallback(async () => {
    let currentStats = stats
    if (!currentStats) {
      const res = await fetch(`${API}`)
      currentStats = await res.json() as Stats
      setStats(currentStats)
    }
    const index = Math.floor(Math.random() * (currentStats.unique_addresses ?? 0))
    push(`/?index=${index}`)
  }, [API, push, stats])

  const handlePrevious = useCallback(async () => {
    if (cardState.monic) {
      push(`/?index=${cardState.monic.index - 1}`)
    }
  }, [cardState.monic, push])

  const handleNext = useCallback(async () => {
    if (cardState.monic) {
      push(`/?index=${cardState.monic.index + 1}`)
    }
  }, [cardState.monic, push])

  useEffect(() => {
    if (myAddress) {
      handleAddressChange(myAddress, false)
    } else {
      setCardState(({ ...state }) => ({ ...state, addressValid: true, wordsValid: true, address: "", words: "", monic: undefined }))
    }
  }, [myAddress, handleAddressChange])

  useEffect(() => {
    if (!cardState.addressValid) {
      setHelper("Invalid address or ENS")
    } else if (!cardState.wordsValid) {
      setHelper("Invalid words")
    } else if (cardState.monic) {
      const { address } = cardState
      if (isAddress(address)) {
        client.getEnsName({ address }).then((name) => {
          setHelper(name ?? checksumAddress(address))
        })
      } else {
        setHelper(checksumAddress(cardState.monic.address))
      }
    } else {
      setHelper("-")
    }
  }, [cardState, client])

  useEffect(() => {
    if (query.index && !isNaN(Number(query.index))) {
      (async () => {
        setLoading(true)
        setCardState(({ ...state }) => ({ ...state, monic: undefined }))
        const res = await fetch(`${API}/index/${query.index}`)
        const monic = await res.json() as Monic
        setCardState(({ ...state }) => ({ ...state, address: checksumAddress(monic.address), words: monic.monic, monic }))
        setLoading(false)
      })()
    }
  }, [API, query])

  const toggleFAQ = useCallback(() => {
    setFAQOpen((open) => !open)
  }, [setFAQOpen])

  let failureBorder = "" //"border-red-500 border-2 rounded-lg"

  let addrLink = (!loading && cardState.wordsValid && cardState.words) ? `${cardState.words.split(' ').join('-')}.addr.id` : "addr.id"

  console.log("cardState", cardState)

  return (
    <div className="container flex flex-col items-center justify-center py-2 pt-20">
      <Card className="w-5/6 max-w-lg shadow-[0px_10px_60px_15px_rgba(48,80,128,0.4)]">
        <div className="mb-3 w-full">
          <form onSubmit={(e) => { e.preventDefault(); handleAddressChange(cardState.address, true) }}>
            <TextInput
              value={loading ? "loading..." : cardState.address}
              onFocus={(event) => event.target.select()}
              onChange={({ target }) => handleAddressChange(target.value, false)}
              className={`font-bold ${cardState.addressValid ? "" : failureBorder}`}
              addon=""
              spellCheck={false}
              placeholder="Ethereum address or ENS"
            />
          </form>
        </div>
        <div className="mb-3 w-full">
          <TextInput
            id="wordsInput"
            value={loading ? "loading..." : cardState.words ?? "not found"}
            onFocus={(event) => event.target.select()}
            onChange={({ target }) => handleWordsChange(target.value)}
            className={`lowercase font-bold ${cardState.addressValid ? "" : failureBorder}`}
            helperText={
              <span className="block overflow-hidden text-ellipsis whitespace-nowrap">{helper}</span>
            }
            placeholder="Monic"
          />
          <div className="mt-2 p-1 flex justify-center align-baseline shadow-lg border-2 border-blue-400 dark:border-blue-900 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <ThemeImage
              srcDark={LightEnsMark}
              srcLight={DarkEnsMark}
              alt="ENS Mark"
              className="h-4 w-auto mr-2 self-center" />
            <Link
              href={`https://app.ens.domains/${addrLink}`}
              target="_blank"
              className="text-blue-500 font-semibold hover:underline"
            >
              {addrLink}
            </Link>

          </div>
        </div>
        <Button.Group className="w-full">
          <Button
            color="gray"
            disabled={cardState.monic?.index === 0}
            onClick={handlePrevious}>
            <FaAngleLeft />
          </Button>
          <Button
            className="w-full"
            color="gray"
            onClick={handleRandom}>
            View a random Monic
          </Button>
          <Button
            color="gray"
            onClick={handleNext}>
            <FaAngleRight />
          </Button>
        </Button.Group>
        {myAddress ?
          <Button.Group className="w-full">
            <Button
              onClick={() => handleAddressChange(myAddress, true)}
              className="w-full">{
                cardState.address === myAddress ?
                  "This is you!"
                  :
                  "Check my monic"
              }
            </Button>
            <Button onClick={() => open()} color="light"><FaWallet className="h-5 w-5" /></Button>
          </Button.Group>
          :
          <Button
            className="mb-3"
            onClick={() => open()}
          >
            <FaWallet className="mr-2 h-5 w-5" />
            My Monic
          </Button>
        }
      </Card>
      <Link href={process.env.NEXT_PUBLIC_SOCIAL_LINK ?? "#"} target="_blank" className="flex items-center mt-10 mb-10 dark:text-white">
        <i className="fc fc-farcaster"></i>
      </Link>
      <div className="flex flex-col items-center max-w-lg">
        <button
          onClick={toggleFAQ}
          className="flex w-auto items-center font-medium text-gray-500 dark:text-gray-400">
          What&apos;s all this?
          <span>
            {FAQOpen ?
              <FaAngleUp className="ml-1" />
              :
              <FaAngleDown className="ml-1" />
            }
          </span>
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${FAQOpen ? "max-h-screen" : "max-h-0"}`}>
          <div className="px-5 py-5 text-gray-500 dark:text-gray-400">
            <p className="mb-2 text-left">
              <strong>Monique</strong> is an address naming system for Ethereum.<br />
              Every address that transacted (or received ERC-20 and NFTs, or for every contract created) on mainnet since genesis is assigned a unique 3-words alias. <b>For free.</b><br />
              This alias is called a <code>monic</code>. It uses the same dictionary as <span className="whitespace-nowrap">BIP-19</span> mnemonics.<br />
              Monics are an easy way to remember addresses and share them with others.
              This app is a demonstration of the Monique index.<br />
              <a href="https://github.com/lgaroche/monique-indexer" target="_blank" className="text-blue-500 hover:underline">See the docs</a> for more information
              and <a href={process.env.NEXT_PUBLIC_SOCIAL_LINK ?? "#"} className="text-blue-500 hover:underline" target="_blank">follow Monique</a> on Farcaster for updates.<br />
              <br />
              Oh, I almost forgot: There will be 2-words monics. Stay tuned!
            </p>
            <p>👵</p>
          </div>
        </div>
      </div>
    </div >
  )
}

export default Home
