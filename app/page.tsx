"use client";

import { useCallback, useState } from "react";
import FeedView from "@/components/FeedView";
import RightRail from "@/components/RightRail";
import Sidebar from "@/components/Sidebar";
import TeknoMapsView from "@/components/TeknoMapsView";
import TopBar from "@/components/TopBar";
import type { NavTabId, TopTabId } from "@/lib/types";

const PAGE_TITLES: Record<NavTabId, string> = {
  feed: "Anasayfa",
  explore: "Keşfet",
  teknomaps: "TeknoMaps",
  notifications: "Bildirimler",
  messages: "Mesajlar",
  profile: "Profil",
};

export default function Page() {
  const [navTab, setNavTab] = useState<NavTabId>("feed");
  const [topTab, setTopTab] = useState<TopTabId>("trends");

  const isMapView = navTab === "teknomaps";

  const handleNavChange = useCallback((tab: NavTabId) => {
    setNavTab(tab);
    setTopTab(tab === "teknomaps" ? "teknomaps-live" : "trends");
  }, []);

  const handleTopChange = useCallback((tab: TopTabId) => {
    setTopTab(tab);
    setNavTab((current) => {
      if (tab === "teknomaps-live") return "teknomaps";
      return current === "teknomaps" ? "feed" : current;
    });
  }, []);

  const openMaps = useCallback(() => handleNavChange("teknomaps"), [handleNavChange]);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-ns-bg">
      <Sidebar activeTab={navTab} onChangeTab={handleNavChange} />

      <main className="flex min-w-0 flex-1 flex-col border-x border-ns-border">
        <TopBar
          activeTab={topTab}
          onChangeTab={handleTopChange}
          compact={isMapView}
          title={PAGE_TITLES[navTab]}
        />

        {isMapView ? (
          <div className="relative min-h-0 flex-1">
            <TeknoMapsView />
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <FeedView navTab={navTab} topTab={topTab} onOpenMaps={openMaps} />
          </div>
        )}
      </main>

      {!isMapView ? <RightRail onOpenMaps={openMaps} /> : null}
    </div>
  );
}
