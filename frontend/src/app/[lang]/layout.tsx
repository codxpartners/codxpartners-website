import type { Metadata } from "next";
import "./globals.css";
import { getStrapiMedia, getStrapiURL } from "./utils/api-helpers";
import { fetchAPI } from "./utils/fetch-api";

import { i18n } from "../../../i18n-config";
import Script from 'next/script';
import Banner from "./components/Banner";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Image from "next/image";
import UtilityNav from "./components/UtilityNav";
import { FALLBACK_SEO } from "@/app/[lang]/utils/constants";


async function getGlobal(lang: string): Promise<any> {
  const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

  if (!token) throw new Error("The Strapi API Token environment variable is not set.");

  const path = `/global`;
  const options = { headers: { Authorization: `Bearer ${token}` } };

  const urlParamsObject = {
    populate: [
      "metadata.shareImage",
      "favicon",
      "notificationBanner.link",
      "navbar.links",
      "navbar.navbarLogo.logoImg",
      "footer.footerLogo.logoImg",
      "footer.menuLinks",
      "footer.legalLinks",
      "footer.socialLinks",
      "footer.categories",
    ],
    locale: lang,
  };
  return await fetchAPI(path, urlParamsObject, options);
}

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const meta = await getGlobal(params.lang);

  if (!meta.data) return FALLBACK_SEO;

  const { metadata, favicon } = meta.data.attributes;
  const { url } = favicon.data.attributes;

  return {
    title: metadata.metaTitle,
    description: metadata.metaDescription,
    icons: {
      icon: [new URL(url, getStrapiURL())],
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  readonly children: React.ReactNode;
  readonly params: { lang: string };
}) {
  const global = await getGlobal(params.lang);
  // TODO: CREATE A CUSTOM ERROR PAGE
  if (!global.data) return null;

  const { notificationBanner, navbar, footer } = global.data.attributes;

  const navbarLogoUrl = getStrapiMedia(
    navbar.navbarLogo.logoImg.data?.attributes.url
  );

  const footerLogoUrl = getStrapiMedia(
    footer.footerLogo.logoImg.data?.attributes.url
  );

  return (
    <html lang={params.lang}>
     
      <body>
        <div className="w-full h-screen tint flex flex-col md:flex-row">
          <div className="hidden md:block md:w-3/12 w-full image-tint">
            <Image src="https://images.pexels.com/photos/878153/pexels-photo-878153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="Endless journey"
              className="object-cover w-full h-auto md:h-full"
              width={450}
              height={850}
            />
          </div>
          <div className="md:w-5/12 w-full pl-4 md:pl-20 flex flex-col justify-end" style={{ height: '100%' }}>
            <div style={{ marginBottom: '25%' }}>
              <Image
                src="https://graceful-talent-f765bfd7e2.media.strapiapp.com/Icon_3e2c39791e.svg"
                width={60}
                height={60}
                alt="Codx Partners"
              />
              <h1 className="text-3xl md:text-5xl text-white font-display pt-10">We know how you’re feeling...</h1>
              <p className="text-white font-light leading-relaxed pt-4 mr-4 md:mr-40">
                We help business leaders and their partners design fit-for-purpose customer experiences that are ruthlessly aligned to your business vision that drive growth, reduce cost and mitigate risk.
              </p>

              <p className="text-white font-bold pt-6">Coming soon</p>

              <div data-mooform-id="41ac37d3-a615-4e97-a220-e76c0786ab07" ></div>

              <p className="text-white font-light pt-6">
                <a href="mailto:hello@codxpartners.com">hello@codxpartners.com</a>
              </p>
            </div>
          </div>
        </div>


      </body>
    </html>
  );
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}
