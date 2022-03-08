import Head from "next/head"

type MetaTagsProps = {
  subtitle?: string,
  description?: string
}

const MetaTags = ({ subtitle, description }: MetaTagsProps) => {
  return (
    <Head>
      <title>Oinkbooks{subtitle && ` - ${subtitle}`}</title>
      <meta name="description" content={description || "Oinkbooks is a web application for visualising and tracking personal expenses to meet financial goals."} />
      <meta name="viewport" content="initial-scale=1, width=device-width" />
    </Head>
  )
}
export default MetaTags