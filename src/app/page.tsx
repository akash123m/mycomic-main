"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getComics, getGenres, getSession, queryKeys, requestJson } from "@/lib/api";
import { useSettings } from "@/components/providers/SettingsProvider";
import ComicCard from "@/components/ui/ComicCard";
import NewsletterForm from "@/components/ui/NewsletterForm";
import ReadingCTAButton from "@/components/reader/ReadingCTAButton";
import LoadingState from "@/components/ui/LoadingState";
import { useEffect, useState } from "react";

export default function Home() {
  const settings = useSettings();
  const { data: comics = [], isLoading } = useQuery({ queryKey: queryKeys.comics, queryFn: getComics });
  const { data: genres = [] } = useQuery({ queryKey: queryKeys.genres, queryFn: getGenres });
  const { data: session } = useQuery({ queryKey: queryKeys.session, queryFn: getSession });
  const { data: history = [] } = useQuery({ queryKey: queryKeys.history, queryFn: () => requestJson<{comicId:string;pageIndex:number;chapter:{number:number;title:string};comic:{slug:string;title:string;coverImage:string}}[]>("/api/reader/history"), enabled: session?.role === "READER" });
  const resume = history[0];
  const featured = [...comics].sort((a, b) => {
    const score = (comic: typeof a) => (comic.views || 0) + (comic.likes || 0) * 8 + comic.chapters.reduce((sum, chapter) => sum + (chapter.views || 0), 0) * 2 + (comic.isFeatured ? 250 : 0);
    return score(b) - score(a);
  })[0];
  const latest = comics.flatMap((comic) => comic.chapters.map((chapter) => ({ comic, chapter }))).sort((a, b) => new Date(b.chapter.publishedAt).getTime() - new Date(a.chapter.publishedAt).getTime() || b.chapter.number - a.chapter.number).slice(0, 8);
  const heroImages = featured ? [featured.bannerImage || featured.coverImage, ...featured.chapters.flatMap((chapter) => chapter.pages.slice(0, 1).map((page) => page.imageUrl))] : [];
  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    if (heroImages.length < 2) return;
    const timer = window.setInterval(() => setHeroIndex((index) => (index + 1) % heroImages.length), 5500);
    return () => window.clearInterval(timer);
  }, [heroImages.length]);

  if (isLoading) return <LoadingState label="Loading your next chapter" variant="page" />;

  return <>
    {featured ? <section className="reader-first-hero">
      <Image key={heroImages[heroIndex]} src={heroImages[heroIndex]} alt={`${featured.title} featured artwork`} fill priority sizes="100vw" className="reader-first-hero-image hero-panel-enter" />
      <div className="reader-first-hero-shade" />
      <div className="container-main reader-first-hero-content">
        <p className="hero-status">{featured.genres.slice(0, 2).join(" · ")} <span>·</span> {featured.status}</p>
        <h1>{featured.title}</h1><p className="hero-synopsis">{featured.synopsis}</p>
        <div className="hero-actions"><ReadingCTAButton location="detail" comicId={featured.id} slug={featured.slug} firstChapter={featured.chapters[0]?.number ?? 1} size="lg" /><Link className="series-link" href={`/comic/${featured.slug}`}>View series <span>→</span></Link></div>
        {heroImages.length > 1 ? <div className="hero-dots" aria-label="Featured artwork carousel">{heroImages.map((_, index) => <button key={index} aria-label={`Show artwork ${index + 1}`} aria-current={index === heroIndex} onClick={() => setHeroIndex(index)} />)}</div> : null}
      </div>
    </section> : <section className="catalog-empty container-main"><p>YOUR ORIGINAL SERIES, YOUR WAY</p><h1>{settings.heroTitle}</h1><span>Publish your first visible series from the admin dashboard to launch the reader.</span><Link href="/admin/comics" className="series-link">Open comic manager →</Link></section>}

    {featured ? <main className="home-library container-main">
      {resume ? <section className="continue-strip" aria-labelledby="continue-heading">
        <div><span className="section-label">Your reading</span><h2 id="continue-heading">Continue reading</h2><p>Resume your saved database progress in Chapter {resume.chapter.number}: {resume.chapter.title}.</p></div>
        <div className="continue-cover"><Image src={resume.comic.coverImage} alt={`${resume.comic.title} cover`} fill sizes="160px" /></div>
        <div className="continue-meta"><strong>{resume.comic.title}</strong><span>Chapter {resume.chapter.number} · Page {resume.pageIndex + 1}</span></div>
        <Link className="series-link" href={`/comic/${resume.comic.slug}/read/${resume.chapter.number}?page=${resume.pageIndex}`}>Continue →</Link>
      </section> : null}

      <section className="latest-section" id="updates"><div className="editorial-heading"><div><span className="section-label">Fresh panels</span><h2>Latest updates</h2></div><Link href={`/comic/${featured.slug}`}>All chapters →</Link></div>
        <div className="update-list">{latest.map(({ comic, chapter }, index) => <Link className="update-row" href={`/comic/${comic.slug}/read/${chapter.number}`} key={chapter.id}>
          <div className="update-thumb"><Image src={comic.coverImage} alt="" fill sizes="84px" /></div><div className="update-title"><strong>{comic.title}</strong><span>Chapter {chapter.number}: {chapter.title}</span></div><span className="update-date">{new Date(chapter.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span><span className="update-views">{chapter.views.toLocaleString()} views</span>{index === 0 ? <b className="new-tag">NEW</b> : null}
        </Link>)}</div>
      </section>

      <section className="collection-section" id="browse"><div className="editorial-heading"><div><span className="section-label">Original collection</span><h2>Read every series</h2></div><Link href="/genres">Browse library →</Link></div><div className="comic-card-grid">{comics.map((comic) => <ComicCard key={comic.id} title={comic.title} slug={comic.slug} coverImage={comic.coverImage} genres={comic.genres} rating={comic.rating} chapterCount={comic.chapters.length} views={comic.views} likes={comic.likes} size="sm" />)}</div></section>

      <section className="genre-rail" id="genres"><div><span className="section-label">Find your mood</span><h2>Explore genres</h2></div><div>{genres.map((genre) => <Link key={genre.id} href={`/genres?filter=${encodeURIComponent(genre.name)}`}>{genre.name}<span>{genre.comicCount}</span></Link>)}</div></section>
      {settings.showNewsletter ? <section className="newsletter-band"><div><span className="section-label">New chapter alerts</span><h2>Never miss an update.</h2><p>One quiet email when a new chapter goes live.</p></div><NewsletterForm source="homepage" /></section> : null}
    </main> : null}
  </>;
}
