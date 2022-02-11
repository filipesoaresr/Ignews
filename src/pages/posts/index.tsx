import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import { getPrismicClient } from '../../services/prismic';

import styles from './styles.module.scss';

type Post = {
    slug: string;
    title: string;
    excerpt: string;
    updatedAt: string;
}

interface PostProps {   
    posts: Post[];
}

export default function Posts({ posts }: PostProps) {

    return (
        <>
            <Head>
                <title>Posts | Ignews</title>
            </Head>

            <main className={styles.container}>
                <div className={styles.posts}>

                    {posts.map(post => (

                        <Link key={post.slug} href={`/posts/${post.slug}`}>
                            <a>
                                <time>{post.updatedAt}</time>
                                <strong>{post.title}</strong>
                                <p>{post.excerpt}</p>
                            </a>
                        </Link>

                    ))}

                </div>
            </main>
        </>
    );
}


// Todos podem ter acesso a página por ser gerada de forma estatica
export const getStaticProps: GetStaticProps = async () => {

    const prismic = getPrismicClient()

    const response = await prismic.query<any>([
        Prismic.predicates.at('document.type', 'publication')
    ], {
        fetch: ['publication.title', 'publication.content'],
        pageSize: 100,
    })

    const posts = response.results.map(post => {
        return {
            slug: post.uid,
            title: RichText.asText(post.data.title),
            //Se não for encontrado conteudo do tipo paragrafo em text retornará uma string vazia
            excerpt: post.data.content.find(content => content.type == 'paragraph') ?.text ?? '',
            updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            })
        }
    })

    return {
        props: {posts}
    }
}