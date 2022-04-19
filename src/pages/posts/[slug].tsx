import { GetServerSideProps } from "next"
import { getSession } from "next-auth/react"
import Head from "next/head"
import { RichText } from "prismic-dom"
import { getPrismicClient } from "../../services/prismic"
import styles from './post.module.scss';


interface PostProps {
    post: {
        slug: string;
        title: string;
        content: string;
        updatedAt: string;
    }
}


// Páginas geradas de Forma estatica não são protegidas
export default function Post({ post }: PostProps) {
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
                        className={styles.postContent} 
                        dangerouslySetInnerHTML={{__html: post.content}} />
                </article>
            </main>
        </>

    )
}


// Necessita acessar a API do Prismic toda vez para buscar o conteudo do post
//Mas garante que somente os usuarios logados teram acesso ao post 
export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {

    //Saber se o usuario está Logado
    const session = await getSession({ req })
    //Ter acesso ao slug do post a ser carregado 
    const { slug } = params;

    if(!session?.activeSubscription) {
        return {
            redirect: {
                destination: `/posts/preview/${slug}`,
                permanent: false,
            }
        }
    }

    console.log(session)

    const prismic = getPrismicClient(req)

    //Buscar os dados do prismic
    const response = await prismic.getByUID<any>('publication', String(slug), {})

    //Formatação
    const post = {
        slug,
        title: RichText.asText(response.data.title),
        content: RichText.asHtml(response.data.content),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    };
    return {
        props: {post}
    } 
}
