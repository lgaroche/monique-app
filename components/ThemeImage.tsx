import styles from './theme-image.module.css'
import Image, { ImageProps } from 'next/image'

type Props = Omit<ImageProps, 'src' | 'priority' | 'loading'> & {
    srcLight: string
    srcDark: string
}

const ThemeImage = (props: Props) => {
    const { srcLight, srcDark, ...rest } = props
    const darkClasses = `${styles.imgDark} ${rest.className || ''}`
    const lightClasses = `${styles.imgLight} ${rest.className || ''}`

    return (
        <>
            <Image {...rest} src={srcLight} className={lightClasses} />
            <Image {...rest} src={srcDark} className={darkClasses} />
        </>
    )
}

export default ThemeImage