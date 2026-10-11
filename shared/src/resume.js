import { visiblePortfolio } from "./schema.js";

// Keep the user's wording and ordering; this is an excerpt, never generated copy.
function excerpt(value, maximum) {
  const text = value.replace(/\s+/g, " ").trim();
  const characters = Array.from(text);
  if (characters.length <= maximum) return text;
  let shortened = characters.slice(0, maximum - 1).join("");
  const boundary = shortened.lastIndexOf(" ");
  if (boundary > maximum * 0.6) shortened = shortened.slice(0, boundary);
  return shortened.trimEnd() + "…";
}

export function resumePortfolio(input, level = 0) {
  const p = visiblePortfolio(input);
  const limits = [
    {
      prose: 180,
      description: 110,
      projects: 2,
      roles: 2,
      skills: 12,
      links: 2,
    },
    {
      prose: 130,
      description: 75,
      projects: 2,
      roles: 1,
      skills: 10,
      links: 2,
    },
    { prose: 90, description: 50, projects: 1, roles: 1, skills: 8, links: 1 },
    { prose: 60, description: 35, projects: 1, roles: 1, skills: 6, links: 1 },
  ][Math.max(0, Math.min(3, level))];
  p.identity.headline = excerpt(p.identity.headline, 100);
  p.identity.location = excerpt(p.identity.location, 60);
  p.about = excerpt(p.about, limits.prose);
  p.contact = excerpt(p.contact, limits.prose);
  p.skills = p.skills
    .slice(0, limits.skills)
    .map((skill) => excerpt(skill, 30));
  p.projects = p.projects.slice(0, limits.projects).map((project) => ({
    ...project,
    title: excerpt(project.title, 60),
    tags: excerpt(project.tags, 45),
    description: excerpt(project.description, limits.description),
  }));
  for (const id of ["experience", "education", "achievements"]) {
    p[id] = p[id]
      .slice(0, id === "experience" ? limits.roles : 1)
      .map((item) => ({
        ...item,
        title: excerpt(item.title, 60),
        organization: excerpt(item.organization, 60),
        period: excerpt(item.period, 32),
        description: excerpt(item.description, limits.description),
      }));
  }
  p.links = p.links
    .slice(0, limits.links)
    .map((link) => ({ ...link, label: excerpt(link.label, 50) }));
  return p;
}
