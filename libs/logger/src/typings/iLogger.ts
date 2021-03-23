type Fn = (...args: unknown[]) => void;

/**
 * | Value | Severity | Key | Description | Notes |
 * | --- | --- | --- | --- | --- |
 * | 0 | Emergency | `emerg` | System is unusable | 💣🔥 As bad as it gets |
 * | 1 | Alert | `alert` | | Corrective action must be taken immediately by a human |
 * | 2 | Critical | `crit` | Above and beyond a normal error | Potential effects elsewhere in the process |
 * | 3 | Error | `error` | Something bad happened | Try/catch blocks usually |
 * | 4 | Warning | `warning` | Might need eyes | Treading into dangerous waters |
 * | 5 | Notice | `notice` | Normal, but significant conditions |
 * | 6 | Informational | `info` | Informational messages | |
 * | 7 | Debug | `debug` | Debug level messages | Messages that contain information normally of use only when debugging a program. |
 */
export interface iLogger {
  // #region Object Properties

  /**
   * - Priority: 1
   * - Color: Orange
   *
   * Corrective action must be taken immediately by a human
   */
  alert: Fn;
  /**
   * - Priority: 2
   * - Color: Tan
   *
   * Something that goes above and beyond a normal error somehow with potential effects elsewhere in the process
   */
  crit: Fn;
  /**
   * - Priority: 7
   * - Color: White
   *
   * Messages that contain information normally of use only when debugging a program. Tracing function calls and such
   */
  debug: Fn;
  /**
   * - Priority: 0
   * - Color: Acid Green
   *
   * 💣🔥 As bad as it gets. We'll all live happier lives never seeing this
   */
  emerg: Fn;
  /**
   * - Priority: 3
   * - Color: Red
   *
   * Bad things that happen, but are contained (try/catch typically)
   */
  error: Fn;
  /**
   * - Priority: 6
   * - Color: Blue
   *
   * Informational messages
   */
  info: Fn;
  /**
   * - Priority: 5
   * - Color: notice
   *
   * Normal, but significant
   */
  notice: Fn;
  /**
   * - Priority: 4
   * - Color: Yellow
   *
   * Less than an error, but might need eyes
   */
  warning: Fn;

  // #endregion Object Properties
}
