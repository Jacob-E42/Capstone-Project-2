import React, { useCallback, useContext, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Journal from "./Journal";
import LoadingSpinner from "../common/LoadingSpinner";
import UserContext from "../context_providers/UserContext";
import AlertContext from "../context_providers/AlertContext";
import ApiContext from "../context_providers/ApiContext";
import useLocalStorage from "../hooks/useLocalStorage";
import { getCurrentDate } from "../common/dateHelpers";
import StreakDisplay from "../streak/StreakDisplay";
import Feedback from "../feedback/Feedback";
import Emotions from "../emotions/Emotions";
import { validateDateUserAndApi, validateJournalInfo } from "../common/validations";
// import useValidateDate from "../hooks/useValidateDate";

const JournalEntryPage = () => {
	let { date } = useParams("date");
	if (!date) date = getCurrentDate();
	const lastVisitedPage = useRef(getCurrentDate());
	const dateHasJournalEntry = useRef(false);
	const { user } = useContext(UserContext);
	const { api } = useContext(ApiContext);
	const { setMsg, setColor } = useContext(AlertContext);
	const allInfoDefined = validateDateUserAndApi(date, user, api); //only verifies date, user, and qpi. Not setMsg, or setColor
	const navigate = useNavigate();
	const [currentJournal, setCurrentJournal] = useLocalStorage("currentJournal", null);
	const [journalLoaded, setJournalLoaded] = useLocalStorage("journalLoaded", false);
	const [feedbackPending, setFeedbackPending] = useLocalStorage("feedbackPending", false);
	const [feedback, setFeedback] = useLocalStorage("feedback", null);
	const [feedbackReceived, setFeedbackReceived] = useLocalStorage("feedbackReceived", false);
	const [emotionsReceived, setEmotionsReceived] = useLocalStorage("emotionsReceived", false);
	const [emotionsPending, setEmotionsPending] = useLocalStorage("setEmotionsPending", false);

	// console.debug(
	// 	"JournalEntryPage",
	// 	"date=",
	// 	date,
	// 	"user=",
	// 	user,
	// 	"api=",
	// 	api,
	// 	"allInfoDefined=",
	// 	allInfoDefined,
	// 	"journal=",
	// 	currentJournal,
	// 	"journalLoaded=",
	// 	journalLoaded,
	// 	"feedbackPending=",
	// 	feedbackPending,
	// 	"feedbackReceived=",
	// 	feedbackReceived,
	// 	"emotionsReceived=",
	// 	emotionsReceived,
	// 	"emotions=",
	// 	currentJournal?.emotions
	// );

	useEffect(() => {
		// console.debug("useEffect - JournalEntryPage", "date=", date, "currentJournal=", currentJournal);
		setJournalLoaded(false);
		if (allInfoDefined) {
			setFeedback(null);
			setCurrentJournal(null);
			loadJournalEntry();
		}
		// eslint-disable-next-line
	}, [date, api]);

	// ?? This causes a rerender whenever currentJournal is updated. Currently only when loadJournalEntry or
	// when editJournal are called.
	// useEffect(() => {}, [currentJournal]);

	const loadJournalEntry = useCallback(async () => {
		console.debug("loadJournalEntry");
		try {
			const resp = await api.getJournalEntryByDate(user.id, date);
			// console.debug("Here is the RESPONSE", resp);

			setCurrentJournal(resp);
			await setJournalLoaded(true);
			lastVisitedPage.current = date;
			// dateHasJournalEntry.current = true;
		} catch (err) {
			console.error(err, err.status, "lastVisitedPage:", lastVisitedPage.current);
			setMsg(err.message);
			setColor("error");
			// if (err.status === 404) {
			// 	setJournalLoaded(true);
			// } else {
			// 	setJournalLoaded(false);
			// }
			// dateHasJournalEntry.current = false;
			setCurrentJournal(null);
			navigate(`/journal/${lastVisitedPage.current}`);
		}
	}, [setMsg, setColor, api, date, user, setCurrentJournal, setJournalLoaded, navigate]);

	const editJournal = useCallback(
		async data => {
			console.debug("JournalEntryPage editJournal", "currentJournal=", currentJournal, "data=", data);
			setJournalLoaded(false);
			if (!currentJournal) {
				setMsg("Creating a new journal entry failed!");
				setColor("error");
			} else {
				await setFeedbackPending(true);
				await setEmotionsPending(true);
				try {
					// console.log(currentJournal, data);

					const updateJournal = await api.editJournalEntry(
						currentJournal.userId,
						data.title,
						data.entryText,
						currentJournal.entryDate,
						currentJournal.journalType
					);
					// console.log(updateJournal);
					if (updateJournal) {
						setMsg("Journal entry updated!");
						setColor("success");
						setJournalLoaded(true);
					}
				} catch (err) {
					// console.log(err);
					setJournalLoaded(true);
				}
			}
		},
		[currentJournal, setColor, setMsg, api, setJournalLoaded, setFeedbackPending, setEmotionsPending]
	);

	const fetchFeedback = useCallback(() => {
		console.debug("fetchFeedback");
		async function loadFeedback() {
			setFeedbackReceived(false);
			const { id, userId, title, entryText, journalType } = currentJournal;
			const validJournal = validateJournalInfo(id, userId, title, entryText, date, journalType);
			if (validJournal.valid) {
				try {
					console.debug("Journal is valid");
					const feedback = await api.getFeedback(id, userId, entryText, journalType, title, date);
					if (feedback && !feedback.error) {
						setMsg("Feedback Received!");
						setColor("success");
						setFeedback(feedback);
						setFeedbackReceived(true);
					} else throw feedback.error;
				} catch (err) {
					console.error(err);
					setMsg("Loading Feedback Failed");
					setColor("error");
				}
			} else {
				setMsg("Journal is NOT valid");
				console.debug(validJournal.error);
			}
		}
		loadFeedback();

		setFeedbackPending(false);
	}, [api, currentJournal, setMsg, setColor, date, setFeedback, setFeedbackReceived, setFeedbackPending]);

	useEffect(() => {
		console.debug("useEffect -> fetchFeedback()");
		if (currentJournal && currentJournal.entryText && feedbackPending) {
			fetchFeedback();
		} else {
			// console.warn("FEEDBACK IS NOT PENDING", feedbackPending, currentJournal?.entryText);
			setMsg("An error occurred trying to load feedback.");
			setColor("error");
		}
		// eslint-disable-next-line
	}, [feedbackPending]);

	const fetchEmotions = useCallback(() => {
		console.debug("fetchEmotions");
		async function loadEmotions() {
			setEmotionsReceived(false);
			const { id, userId, title, entryText, journalType } = currentJournal;
			const validJournal = validateJournalInfo(id, userId, title, entryText, date, journalType);
			if (validJournal.valid) {
				try {
					console.debug("Journal is valid");
					const resp = await api.getEmotions(id, userId, entryText, journalType, title, date);
					console.log(resp);

					if (resp) {
						setMsg("Emotions Received!");
						setColor("success");
						const newJournal = currentJournal;
						newJournal["emotions"] = resp;
						setCurrentJournal(newJournal);
						setEmotionsReceived(true);
					}
				} catch (err) {
					console.error(err);
					setMsg("Loading Emotions Failed");
					setColor("error");
				}
			} else {
				setMsg("Journal is NOT valid");
				console.debug(validJournal.error);
			}
		}
		loadEmotions();
		setEmotionsPending(false);
	}, [api, currentJournal, setMsg, setColor, date, setCurrentJournal, setEmotionsReceived, setEmotionsPending]);

	useEffect(() => {
		console.debug("useEffect -> fetch Emotions()");
		if (currentJournal && currentJournal.entryText && emotionsPending) {
			fetchEmotions();
		} else {
			// console.warn("Emotions Are NOT PENDING", emotionsPending, currentJournal?.entryText);
		}
		// eslint-disable-next-line
	}, [emotionsPending]);

	// const quickCheckJournal = useCallback(async () => {
	// 	return await api.quickCheckJournalEntry(user.id, date);
	// }, [user.id, api, date]);

	// const quickCheckMultipleJournals = useCallback(
	// 	async dateRange => {
	// 		return await api.quickCheckJournalEntriesBatch(user.id, dateRange);
	// 	},
	// 	[user.id, api]
	// );

	if (!journalLoaded || !currentJournal) return <LoadingSpinner />;

	console.log(
		"test",
		"allInfoDefined",
		allInfoDefined,
		"currentJournal",
		currentJournal,
		"journalloaded:",
		journalLoaded
	);

	return (
		<>
			{/* {allInfoDefined && !currentJournal && date && (
				<Navigate
					to={`/journal/${lastVisitedPage.current}`}
					replace
				/>
			)} */}
			<StreakDisplay date={date} />
			{allInfoDefined && currentJournal && (
				<Journal
					date={date}
					title={currentJournal.title}
					entryText={currentJournal.entryText}
					jounalType={currentJournal.journalType}
					setJournal={setCurrentJournal}
					currentJournal={currentJournal}
					editJournal={editJournal}
				/>
			)}
			{feedbackReceived && currentJournal && <Feedback feedback={feedback} />}
			{emotionsReceived && currentJournal && <Emotions emotions={currentJournal?.emotions} />}
		</>
	);
};

export default JournalEntryPage;

// Development Practices
// The way you use the library can have a bigger impact on performance than the library itself. For instance,
// lazy loading components, optimizing re-renders,
//  and properly managing state can lead to significant performance improvements regardless of the UI library you choose.
