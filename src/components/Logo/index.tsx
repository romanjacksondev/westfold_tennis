import Image from 'next/image'
import santanderLogo from 'assets/icons/tennis-logotipo.svg'

const SantanderLogo = () => {
  return (
    <Image
      src={santanderLogo.src}
      height={santanderLogo.height}
      width={santanderLogo.width}
      alt="Santander"
    />
  )
}

export default SantanderLogo
