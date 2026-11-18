import { notFound } from 'next/navigation'
import { sanityFetch, urlFor } from '@/lib/sanity'
import { projectBySlugQuery } from '@/lib/queries'
import ProjectDetail from '@/components/projects/ProjectDetail'
import { plainText } from '@/lib/text'

export const revalidate = 60

export async function generateMetadata(props) {
  const params = await props.params;
  const project = await sanityFetch(projectBySlugQuery, {
    slug: params.projectId,
  })
  if (!project?.name) return {}
  const description = project.bio?.trim() || plainText(project.description)
  const cover = (project.images || []).find((image) => image?.asset)
  const image = cover
    ? urlFor(cover).width(1200).height(630).fit('crop').url()
    : null
  const url = `/projects/${params.projectId}`
  return {
    title: project.name,
    ...(description ? { description } : {}),
    alternates: { canonical: url },
    openGraph: {
      title: project.name,
      url,
      ...(description ? { description } : {}),
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: project.name,
      ...(description ? { description } : {}),
      ...(image ? { images: [image] } : {}),
    },
  }
}

export default async function ProjectPage(props) {
  const params = await props.params;
  const { projectId } = params
  const project = await sanityFetch(projectBySlugQuery, { slug: projectId })

  if (!project) {
    notFound()
  }

  return <ProjectDetail project={project} />
}
