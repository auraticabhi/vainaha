
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const algoliasearch = require('algoliasearch');

admin.initializeApp();

// const ALGOLIA_APP_ID = functions.config().algolia.app_id;
const ALGOLIA_APP_ID = "8XQGGZTFH3";
const ALGOLIA_ADMIN_KEY = "5e1bde87cc37a1ac675480def089f2a5";
const ALGOLIA_SEARCH_KEY = "bd743f217017ce1ea457a8febb7404ef";
const ALGOLIA_INDEX_NAME = 'search_questions';

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const index = client.initIndex(ALGOLIA_INDEX_NAME);

exports.onQuestionCreated = functions.firestore.document('questions/{questionId}').onCreate((snap, context) => {
    const data = snap.data();
    const objectID = snap.id;

    return index.saveObject({ ...data, objectID }).catch(err => console.error(`Error when indexing question ${objectID}: ${err}`));
});

exports.onQuestionUpdated = functions.firestore.document('questions/{questionId}').onUpdate((change, context) => {
    const newData = change.after.data();
    const objectID = change.after.id;

    return index.saveObject({ ...newData, objectID }).catch(err => console.error(`Error when indexing question ${objectID}: ${err}`));
});


exports.onQuestionDeleted = functions.firestore.document('questions/{questionId}').onDelete((snap, context) => {
    const objectID = snap.id;

    return index.deleteObject(objectID).catch(err => console.error(`Error when deleting question ${objectID}: ${err}`));
});
