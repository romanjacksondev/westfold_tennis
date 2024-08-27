import TextTemplate from './Text.template'
import { TextProps } from './Text.types'

export const Text = (props: TextProps) => {
  return <TextTemplate {...props} />
}
export const TextHero1 = (props: TextProps) => {
  return <Text as="h1" size="text-hero-1" {...props} />
}
export const TextHero2 = (props: TextProps) => {
  return <Text as="h2" size="text-hero-2" {...props} />
}
export const TextHeadingH1 = (props: TextProps) => {
  return <Text as="h1" size="text-heading-h1" {...props} />
}
export const TextHeadingH2 = (props: TextProps) => {
  return <Text as="h2" size="text-heading-h2" {...props} />
}
export const TextHeadingH3 = (props: TextProps) => {
  return <Text as="h3" size="text-heading-h3" {...props} />
}
export const TextHeadingH4 = (props: TextProps) => {
  return <Text as="h4" size="text-heading-h4" {...props} />
}
export const TextHeadingH5 = (props: TextProps) => {
  return <Text as="h5" size="text-heading-h5" {...props} />
}
export const TextHeadingH6 = (props: TextProps) => {
  return <Text as="h6" size="text-heading-h6" {...props} />
}
export const TextSubtitleLg = (props: TextProps) => {
  return <Text as="h4" size="text-subtitle-lg" {...props} />
}
export const TextSubtitle = (props: TextProps) => {
  return <Text as="h5" size="text-subtitle-md" {...props} />
}
export const TextSubtitleSm = (props: TextProps) => {
  return <Text as="h6" size="text-subtitle-sm" {...props} />
}
export const TextBodyLg = (props: TextProps) => {
  return <Text size="text-body-lg" {...props} />
}
export const TextBody = (props: TextProps) => {
  return <Text size="text-body-md" {...props} />
}
export const TextBodySm = (props: TextProps) => {
  return <Text size="text-body-sm" {...props} />
}
export const TextBodyXs = (props: TextProps) => {
  return <Text size="text-body-xs" {...props} />
}
export const TextBodyXxs = (props: TextProps) => {
  return <Text size="text-body-xxs" {...props} />
}
export const Headline = (props: TextProps) => {
  return <Text size="text-heading-h4 sm:text-headline" {...props} />
}
