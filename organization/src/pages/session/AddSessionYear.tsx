import { SessionYearsScreen } from "./AllSessionYears";

/**
 * "Add Session Year" — the same Session Management screen with the create form
 * already open.
 *
 * This page used to be a second, near-identical copy of the session list with
 * its own hardcoded sample array and its own save handler that wrote to React
 * state. Two forms saving to two different places is how the pair drifted apart
 * in the first place, so there is now one screen and one set of writes.
 */
const AddSessionYear = () => <SessionYearsScreen openOnLoad />;

export default AddSessionYear;
