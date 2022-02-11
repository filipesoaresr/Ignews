import { GetStaticPaths, GetStaticProps } from "next"
import { useSession } from "next-auth/react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { RichText } from "prismic-dom"
import { useEffect } from "react"
import { getPrismicClient } from "../../../services/prismic"
import styles from '../post.module.scss';


interface PostPreviewProps {
    post: {
        slug: string;
        title: string;
        content: string;
        updatedAt: string;
    }
}


// Páginas geradas de Forma estatica não são protejadas
export default function PostPreview({ post }: PostPreviewProps) {
    
    const session = useSession();
    const router = useRouter();
    
    useEffect(() => {
        if (session.data?.activeSubscription) {
            router.push(`/posts/${post.slug}`)
        }
    }, [session])
    
    return (
        <>
            <Head>
                <title>{post.title} | Ignews</title>
            </Head>

            <main className={styles.container}>
                <article className={styles.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updatedAt}</time>
                    <div
                        className={`${styles.postContent} ${styles.previewContent}`} 
                        dangerouslySetInnerHTML={{__html: post.content}} 
                    />

                    <div className={styles.continueReading}>
                        Wanna continue reading?
                        <Link  href="/">
                            <a href="">Subscribe Now 🤗</a>
                        </Link>
                    </div>
                </article>
            </main>
        </>

    )
}

//Retorna quais posts gerar durante a build ou quais serão gerados a partir do primeiro acesso
export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [],
        fallback: 'blocking'
    }
}

// Necessita acessar a API do Prismic toda vez para buscar o conteudo do post,
//Poré garante que somente os usuarios logados teram acesso ao post 
export const getStaticProps: GetStaticProps = async ({ params }) => {

    
    //Ter acesso ao slug do post a ser carregado 
    const { slug } = params;

    const prismic = getPrismicClient()

    //Buscar os dados do prismic
    const response = await prismic.getByUID<any>('publication', String(slug), {})

    //Formatação
    const post = {
        slug,
        title: RichText.asText(response.data.title),
        //Splice usado para pegar apenas os 3 primeiros blocos de conteudo para o preview
        content: RichText.asHtml(response.data.content.splice(0, 3)),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    };
    return {
        props: {
            post,
        },
        redirect: 60 * 30, // 30 minutes
    } 
}