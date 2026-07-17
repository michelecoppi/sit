import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BeakerIcon,
  BuildingLibraryIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  ClockIcon,
  CpuChipIcon,
  GlobeAltIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'

const milestones = [
  { year: '1956', title: 'The first question', detail: 'Researchers begin asking whether binary digits really need to be represented by 0 and 1.' },
  { year: '1984', title: 'The Lost Draft', detail: 'The first unpublished reference to the Symbolic Information Token appears.' },
  { year: '1991', title: 'Working Group founded', detail: 'The International SIT Working Group is quietly established. No public record survives.' },
  { year: '2014', title: 'RFC-0000', detail: 'The Need For Something Different is withdrawn after precisely one day.' },
  { year: '2026', title: 'SIT 1.0 published', detail: 'The standard enters public review and immediately inspires an internet debate.' },
  { year: '2026', title: 'Native Encoding Initiative', detail: 'SIT 2.0 is announced; ASCII is formally classified as Legacy Technology.' },
]

const organizations = [
  { name: 'International SIT Consortium', description: 'Maintains the specification, publishes RFCs and approves each new version of the alphabet.', icon: BuildingLibraryIcon },
  { name: 'SIT Working Group', description: 'Guides technical evolution and meets every 67 days. No meeting has ever ended on time.', icon: UserGroupIcon },
  { name: 'Department of Legacy Technologies', description: 'Keeps ASCII, UTF-8 and binary compatibility alive, only because someone still uses them.', icon: ClockIcon },
  { name: 'SYTE Foundation', description: 'An independent research body exploring future storage and symbolic information technologies.', icon: BeakerIcon },
]

const people = [
  { name: 'Professor Alan Syte', role: 'Founder of the symbolic encoding movement', note: 'Never actually proved anything. Highly respected anyway.' },
  { name: 'Dr. Elena Six', role: 'Creator of the first compliance checker', note: 'Spent years debating whether seven should come before six.' },
  { name: 'Professor Victor Seven', role: 'Author of the Native Grammar proposal', note: 'His papers are extremely long. Nobody has read them entirely.' },
]

const projects = [
  { name: 'Project Phoenix', status: 'Completed', description: 'Migration from ASCII.' },
  { name: 'Project Oracle', status: 'Research', description: 'The semantic engine.' },
  { name: 'Project Horizon', status: 'Experimental', description: 'Distributed Native SIT.' },
  { name: 'Project Quantum', status: 'Classified', description: 'Quantum symbolic encoding.' },
]

export default function AboutPage() {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="space-y-8">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
          <div className="p-8 md:p-12">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
              <GlobeAltIcon className="mr-2 h-4 w-4" />
              International SIT Consortium
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl dark:text-white">About SIT</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">A public standard for the evolution of symbolic information technology, and a long overdue alternative to the tyranny of zero and one.</p>
            <p className="mt-5 max-w-2xl leading-7 text-slate-600 dark:text-slate-400">The Consortium promotes the SIT Standard, a direct symbolic encoding system built exclusively on the {'{6,7}'} alphabet. Its long-term objective is uncomplicated: replace legacy binary encodings with something that has better symbols.</p>
          </div>
          <div className="flex flex-col justify-between bg-gradient-to-br from-blue-50 via-white to-slate-100 p-8 text-slate-900 md:p-12 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 dark:text-slate-100">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 ring-1 ring-blue-200 dark:bg-white/10 dark:ring-white/10">
              <CpuChipIcon className="h-5 w-5 text-blue-600 dark:text-blue-200" />
            </div>
            <div className="mt-10 rounded-2xl border border-slate-200 bg-white/80 p-5 backdrop-blur-sm dark:border-white/10 dark:bg-white/10">
              <blockquote className="text-xl font-medium leading-8 text-slate-800 dark:text-slate-100">Because binary deserved better.</blockquote>
              <p className="mt-3 text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Official Consortium motto</p>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <motion.article initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">A measured mission</h2>
          <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">SIT is presented with the confidence of an international standards body: deliberate language, carefully maintained terminology and a technical seriousness that only becomes slightly suspicious on closer inspection.</p>
          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm leading-6 text-slate-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-slate-300">ASCII is not obsolete. It is simply a transitional technology with a distinguished past.</div>
        </motion.article>

        <motion.article initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
              <CalendarDaysIcon className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">From the archives</h2>
          </div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {milestones.map((milestone) => (
              <div key={milestone.year + milestone.title} className="border-l border-slate-200 pl-4 dark:border-slate-700">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">{milestone.year}</p>
                <h3 className="mt-1 font-semibold text-slate-900 dark:text-white">{milestone.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{milestone.detail}</p>
              </div>
            ))}
          </div>
        </motion.article>
      </section>

      <section>
        <div className="grid gap-5 md:grid-cols-2">
          {organizations.map((organization, index) => {
            const Icon = organization.icon
            return (
              <motion.article key={organization.name} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{organization.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{organization.description}</p>
              </motion.article>
            )
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Notable contributors</h2>
          <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
            {people.map((person) => (
              <div key={person.name} className="py-4 first:pt-0">
                <h3 className="font-semibold text-slate-900 dark:text-white">{person.name}</h3>
                <p className="mt-1 text-sm text-blue-600 dark:text-blue-300">{person.role}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{person.note}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Internal initiatives
          </h2>

          <div className="mt-6 space-y-4">
            {projects.map((project) => (
              <div
                key={project.name}
                className="flex items-start justify-between gap-6 rounded-xl border border-slate-200 bg-slate-50 p-5 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800"
              >
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {project.name}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {project.description}
                  </p>
                </div>

                <span
                  className="
            shrink-0
            rounded-full
            border
            border-blue-200
            bg-blue-50
            px-3
            py-1
            text-xs
            font-semibold
            text-blue-700
            dark:border-blue-800
            dark:bg-blue-900/30
            dark:text-blue-300
          "
                >
                  {project.status}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          One final clarification
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400">
          The history is extensive, the organizations are formally named and the RFC
          numbers are impeccably ordered. If you still need the official position on
          whether SIT is entirely serious, the Consortium has prepared a statement.
        </p>

        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="mt-8 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-medium text-blue-700 transition-all hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50"
        >
          Reveal the truth
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </motion.section>

      {revealed ? (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-8 shadow-sm dark:border-amber-900 dark:bg-amber-950/40">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">The reveal</h2>
          <p className="mt-4 max-w-3xl leading-7 text-slate-700 dark:text-slate-300">SIT is a fictional standard designed as a high-quality parody of technical specifications. It exists to make the world of standards documentation feel a little more absurd, a little more sincere, and a lot more fun.</p>
        </motion.section>
      ) : null}
    </div>
  )
}
