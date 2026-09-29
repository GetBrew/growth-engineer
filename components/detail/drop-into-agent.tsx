import styles from './drop-into-agent.module.css'

/**
 * A chat box: the copied file drops into it as an attachment, the send
 * button presses, and the agent’s reply appears above. It plays once and
 * holds the finished picture; for reduced motion it is only that picture.
 */
export function DropIntoAgent() {
  return (
    <svg
      aria-hidden="true"
      className="h-16 w-18 shrink-0 overflow-visible"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 64 56"
    >
      <g className={styles.reply}>
        <rect
          className="fill-surface stroke-foreground/15"
          height="17"
          rx="7"
          strokeWidth="1.5"
          width="38"
          x="4"
          y="5"
        />
        <path
          className="stroke-foreground/40"
          d="M10 11.5h24M10 16.5h15"
          strokeWidth="2.2"
        />
      </g>
      <rect
        className="fill-background stroke-foreground/25"
        height="18"
        rx="9"
        strokeWidth="1.5"
        width="58"
        x="3"
        y="32"
      />
      <g className={styles.chip}>
        <path
          className="fill-background stroke-foreground"
          d="M11 36h5l3 3v7.5a1.5 1.5 0 0 1-1.5 1.5h-6.5a1.5 1.5 0 0 1-1.5-1.5v-9a1.5 1.5 0 0 1 1.5-1.5z"
          strokeWidth="1.5"
        />
        <path className="stroke-foreground" d="M16 36v3h3" strokeWidth="1.5" />
      </g>
      <path
        className={`stroke-foreground/45 ${styles.name}`}
        d="M23 41h16"
        strokeWidth="2.2"
      />
      <g className={styles.send}>
        <circle className="fill-foreground" cx="52" cy="41" r="5.5" />
        <path
          className="stroke-background"
          d="M52 44v-6M49.5 40.5l2.5-2.5 2.5 2.5"
          strokeWidth="1.6"
        />
      </g>
    </svg>
  )
}
