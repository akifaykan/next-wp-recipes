import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { gql } from '@apollo/client';
import { getApolloClient } from '../lib/apollo-client';
import styles from '../styles/Home.module.css';

export default function Home({ page, recipes }) {
    const { title, description } = page;

    return (
        <div className={styles.container}>
            <Head>
                <title>
                    {title} &mdash; {description}
                </title>
                <meta name="description" content={description} />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main}>
                <h1 className={styles.title}>{title}</h1>
                <p className={styles.description}>{description}</p>
                <ul className={styles.grid}>
                    {recipes &&
                        recipes.length > 0 &&
                        recipes.map((recipe) => {
                            const rec = recipe.recipes;
                            return (
                                <li key={recipe.recipesId} className={styles.card}>
                                    <Link href={recipe.path}>
                                        <a>
                                            <Image
                                                className={styles.recipe__photo}
                                                src={rec.recipePhoto.sourceUrl}
                                                height={rec.recipePhoto.mediaDetails.height}
                                                width={rec.recipePhoto.mediaDetails.width}
                                                alt=""
                                            />
                                            <h3
                                                className={styles.otherTitle}
                                                dangerouslySetInnerHTML={{
                                                    __html: recipe.title,
                                                }}
                                            />
                                            <ul className={styles.info}>
                                                <li className={styles.info__item}>
                                                    <p>
                                                        Tür:
                                                        <strong>{rec.recipeType}</strong>
                                                    </p>
                                                </li>
                                                <li className={styles.info__item}>
                                                    <p>
                                                        Tat:
                                                        <strong>{rec.recipeFlavor}</strong>
                                                    </p>
                                                </li>
                                                <li className={styles.info__item}>
                                                    <p>
                                                        Zaman:
                                                        <strong>{rec.recipeTime}</strong>
                                                    </p>
                                                </li>
                                                <li className={styles.info__item}>
                                                    <p>
                                                        Seviye:
                                                        <strong>{rec.recipeDifficulty}</strong>
                                                    </p>
                                                </li>
                                            </ul>
                                        </a>
                                    </Link>
                                </li>
                            );
                        })}
                </ul>
            </main>
        </div>
    );
}

export async function getStaticProps() {
    const apolloClient = getApolloClient();

    const data = await apolloClient.query({
        query: gql`
            {
                generalSettings {
                    title
                    description
                }
                allRecipes(first: 10000) {
                    edges {
                        node {
                            recipesId
                            title
                            slug
                            recipes {
                                recipeType
                                recipeTime
                                recipePhoto {
                                    sourceUrl
                                    srcSet
                                    mediaDetails {
                                        width
                                        height
                                    }
                                }
                                recipeFlavor
                                recipeDifficulty
                            }
                        }
                    }
                }
            }
        `,
    });

    const recipes = data?.data.allRecipes.edges
        .map(({ node }) => node)
        .map((recipe) => {
            return {
                ...recipe,
                path: `/recipes/${recipe.slug}`,
            };
        });

    const page = {
        ...data?.data.generalSettings,
    };

    return {
        props: {
            page,
            recipes,
        },
    };
}
