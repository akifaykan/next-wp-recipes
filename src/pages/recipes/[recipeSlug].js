import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { gql } from '@apollo/client';
import { getApolloClient } from '../../lib/apollo-client';
import styles from '../../styles/Recipe.module.css';

export default function Recipe({ site, recipe }) {
    const rec = recipe.recipes;

    return (
        <div className={styles.container}>
            <Head>
                <title>{recipe.title} &mdash; {site.title}</title>
                <meta
                    name="description"
                    content={`${recipe.title} yemek tarifi`}
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <div className={styles.grid}>
                    <div className={styles.recipePhoto}>
                        <Image
                            src={rec.recipePhoto.sourceUrl}
                            width={rec.recipePhoto.mediaDetails.width}
                            height={rec.recipePhoto.mediaDetails.height}
                            alt=""
                        />
                    </div>

                    <div className={styles.recipeContent}>
                        <h1 className={styles.title}>{recipe.title}</h1>

                        <div className={styles.info}>
                            <div className={styles.info__item}>
                                <p>
                                    Tür：<strong>{rec.recipeType}</strong>
                                </p>
                            </div>
                            <div className={styles.info__item}>
                                <p>
                                    Tat：<strong>{rec.recipeFlavor}</strong>
                                </p>
                            </div>
                            <div className={styles.info__item}>
                                <p>
                                    Zaman：<strong>{rec.recipeTime}</strong>
                                </p>
                            </div>
                            <div className={styles.info__item}>
                                <p>
                                    Seviye：<strong>{rec.recipeDifficulty}</strong>
                                </p>
                            </div>
                        </div>

                        <div
                            className={styles.recipeDescription}
                            dangerouslySetInnerHTML={{
                                __html: recipe.content,
                            }}
                        />

                        <Link href="/">
                            <a className={styles.backToRecipes}>&larr; Back to home</a>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

export async function getStaticProps({ params = {} } = {}) {
    const { recipeSlug } = params;

    const apolloClient = getApolloClient();

    const data = await apolloClient.query({
        query: gql`
            query RecipeBySlug($slug: String!) {
                generalSettings {
                    title
                }
                recipesBy(slug: $slug) {
                    recipesId
                    title
                    slug
                    content
                    recipes {
                        recipeType
                        recipeTime
                        recipeFlavor
                        recipeDifficulty
                        recipePhoto {
                            sourceUrl
                            mediaDetails {
                                width
                                height
                            }
                        }
                    }
                }
            }
        `,
        variables: {
            slug: recipeSlug,
        },
    });

    const recipe = data?.data.recipesBy;

    const site = {
        ...data?.data.generalSettings,
    };

    return {
        props: {
            site,
            recipe,
        },
    };
}

export async function getStaticPaths() {
    const apolloClient = getApolloClient();

    const data = await apolloClient.query({
        query: gql`
            {
                allRecipes(first: 10000) {
                    edges {
                        node {
                            recipesId
                            title
                            slug
                        }
                    }
                }
            }
        `,
    });

    const recipes = data?.data.allRecipes.edges.map(({ node }) => node);

    return {
        paths: recipes.map(({ slug }) => {
            return {
                params: {
                    recipeSlug: slug,
                },
            };
        }),
        fallback: false,
    };
}
