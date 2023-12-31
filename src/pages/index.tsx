"use client";
import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import { useColorMode, useToast } from "@chakra-ui/react";
import {
  useInitWeb3InboxClient,
  useManageSubscription,
  useW3iAccount,
} from "@web3inbox/widget-react";
import "@web3inbox/widget-react/dist/compiled.css";
import ArrowDownTray from "@heroicons/react/20/solid/ArrowDownTrayIcon";
import ArrowUpTray from "@heroicons/react/20/solid/ArrowUpTrayIcon";

import Image from "next/image";

import { useAccount, usePublicClient, useSignMessage } from "wagmi";
import useSendNotification from "../../utils/useSendNotification";
import { useInterval } from "usehooks-ts";
import { sendNotification } from "../../utils/fetchNotify";
import { Layout } from "../components/layout";
import Link from "next/link";
import Arrow from "@heroicons/react/20/solid/ArrowLongDownIcon";
import { Card } from "@radix-ui/themes";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN as string;

const Home: NextPage = () => {
  /** Web3Inbox SDK hooks **/
  const isW3iInitialized = useInitWeb3InboxClient({
    projectId,
    domain: appDomain,
  });
  const {
    account,
    setAccount,
    register: registerIdentity,
    identityKey,
  } = useW3iAccount();
  const {
    subscribe,
    unsubscribe,
    isSubscribed,
    isSubscribing,
    isUnsubscribing,
  } = useManageSubscription(account);

  const { address } = useAccount({
    onDisconnect: () => {
      setAccount("");
    },
  });
  const { signMessageAsync } = useSignMessage();
  const wagmiPublicClient = usePublicClient();

  const { colorMode } = useColorMode();
  const toast = useToast();

  const { handleSendNotification, isSending } = useSendNotification();
  const [lastBlock, setLastBlock] = useState<string>();
  const [isBlockNotificationEnabled, setIsBlockNotificationEnabled] =
    useState(true);

  const signMessage = useCallback(
    async (message: string) => {
      const res = await signMessageAsync({
        message,
      });

      return res as string;
    },
    [signMessageAsync]
  );

  // We need to set the account as soon as the user is connected
  useEffect(() => {
    if (!Boolean(address)) return;
    setAccount(`eip155:1:${address}`);
  }, [signMessage, address, setAccount]);

  const handleRegistration = useCallback(async () => {
    if (!account) return;
    try {
      await registerIdentity(signMessage);
    } catch (registerIdentityError) {
      console.error({ registerIdentityError });
    }
  }, [signMessage, registerIdentity, account]);

  useEffect(() => {
    if (!identityKey) {
      handleRegistration();
    }
  }, [handleRegistration, identityKey]);

  // handleSendNotification will send a notification to the current user and includes error handling.
  // If you don't want to use this hook and want more flexibility, you can use sendNotification.
  const handleTestNotification = useCallback(async () => {
    if (isSubscribed) {
      handleSendNotification({
        title: "GM Hacker",
        body: "Hack it until you make it!",
        icon: `${window.location.origin}/WalletConnect-blue.svg`,
        url: window.location.origin,
        type: "promotional",
      });
    }
  }, [handleSendNotification, isSubscribed]);

  // Example of how to send a notification based on some "automation".
  // sendNotification will make a fetch request to /api/notify
  const handleBlockNotification = useCallback(async () => {
    if (isSubscribed && account && isBlockNotificationEnabled) {
      const blockNumber = await wagmiPublicClient.getBlockNumber();
      if (lastBlock !== blockNumber.toString()) {
        setLastBlock(blockNumber.toString());
        try {
          toast({
            title: "New block",
            position: "top",
            variant: "subtle",
          });
          await sendNotification({
            accounts: [account], // accounts that we want to send the notification to.
            notification: {
              title: "New block",
              body: blockNumber.toString(),
              icon: `${window.location.origin}/eth-glyph-colored.png`,
              url: `https://etherscan.io/block/${blockNumber.toString()}`,
              type: "transactional",
            },
          });
        } catch (error: any) {
          toast({
            title: "Failed to send new block notification",
            description: error.message ?? "Something went wrong",
          });
        }
      }
    }
  }, [
    wagmiPublicClient,
    isSubscribed,
    lastBlock,
    account,
    toast,
    isBlockNotificationEnabled,
  ]);

  useInterval(() => {
    handleBlockNotification();
  }, 12000);

  return (
    <Layout>
      <div className="flex justify-center pt-8 pb-12">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1AD4FF] to-[#FF307E] text-center">
          Protected Term Loans<br></br> Made Easy!
        </h1>
      </div>

      <div className="flex justify-center pb-8 gap-40">
        <Image
          alt="logo svg"
          key={23}
          src="/assets/arrow-left.svg"
          width={120}
          height={120}
        />
        <Image
          alt="logo svg"
          key={23}
          src="/assets/arrow-right.svg"
          width={120}
          height={120}
        />
        {/* <Arrow className="h-40 w-40 rotate-45 text-[#dad6d3]/5" />
        <Arrow className="h-40 w-40 -rotate-45 text-[#dad6d3]/5" /> */}
      </div>

      <div className="flex space-x-16 max-w-4xl m-auto">
        <Link href="/borrow" className="flex-1">
          <Card className="flex justify-center items-center hover:bg-[#1b1b1a]/40 cursor-pointer transition bg-[#202B37] border-none">
            <div className="py-12 text-white text-2xl font-bold group-hover:text-opacity-80 transition">
              <p className="text-center"> I want to Borrow</p>
              <div className="flex justify-center pt-4 mt-4">
                <Image
                  alt="logo svg"
                  key={23}
                  src="/assets/icon-borrow.svg"
                  width={120}
                  height={120}
                />
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/lend" className="flex-1">
          <Card className="flex justify-center items-center hover:bg-[#1b1b1a]/40 cursor-pointer transition  bg-[#391221] border-none">
            <div className="block py-12 text-white text-2xl font-bold group-hover:text-opacity-80 transition">
              <p className="text-center">I want to Lend</p>
              <div className="flex justify-center pt-4 mt-4">
                <Image
                  alt="logo svg"
                  key={23}
                  src="/assets/icon-lend.svg"
                  width={120}
                  height={120}
                />
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </Layout>
  );
};

export default Home;
