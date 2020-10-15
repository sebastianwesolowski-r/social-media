import {takeLatest, all, put, call, select} from 'redux-saga/effects';

import PostsActionTypes from './posts.types';

import {storage, firestore, convertPostsSnapshotToArray, createPost} from '../../firebase/firebase';
import firebase from '../../firebase/firebase';

import {fetchPostsStart, fetchPostsSuccess, fetchPostsFailure, uploadPostSuccess, uploadPostFailure, updatePost} from './posts.actions';

import {selectCurrentUserFollowing} from '../user/user.selectors';

const postsRef = firestore.collection('posts');

export function* fetchPosts() {
    const currentUserFollowing = yield select(selectCurrentUserFollowing);
    try {
        let postsMap = [];
        if(currentUserFollowing.length > 0) {
            const postsSnapshot = yield postsRef.where("uploadedBy", "in", currentUserFollowing).get();
            postsMap = yield call(convertPostsSnapshotToArray, postsSnapshot);
        }
        yield put(fetchPostsSuccess(postsMap));
    } catch(error) {
        yield put(fetchPostsFailure(error));
    }
}

export function* uploadPost({payload: {postMessage, currentUserName, postImage}}) {
    let imageUrl = '';
    try {
        if(postImage) {
            if (postImage.size > 5000000) {
                alert('Image size is too big');
                throw new Error('Image size is too big');
            }
            yield storage.ref(`postImages/${postImage.name}`).put(postImage);
            imageUrl = yield storage.ref("postImages").child(postImage.name).getDownloadURL();
        }
        yield call(createPost, postMessage, currentUserName, imageUrl);
        yield put(uploadPostSuccess());
    } catch(error) {
        yield put(uploadPostFailure(error));
    }
}

export function* likePost({payload: {currentUserName, id}}) {
    const postToLikeRef = yield firestore.doc(`posts/${id}`);
    yield postToLikeRef.update({
        likes: firebase.firestore.FieldValue.arrayUnion(currentUserName)
    });
    yield updatePostState(id);
}

export function* dislikePost({payload: {currentUserName, id}}) {
    const postToDislikeRef = yield firestore.doc(`posts/${id}`);
    yield postToDislikeRef.update({
        likes: firebase.firestore.FieldValue.arrayRemove(currentUserName)
    });
    yield updatePostState(id);
}

export function* commentPost({payload: {postId, currentUserName, comment}}) {
    const postToCommentRef = yield firestore.doc(`posts/${postId}`);
    yield postToCommentRef.update({
        comments: firebase.firestore.FieldValue.arrayUnion({commentedBy: currentUserName, commentContent: comment})
    });
    yield updatePostState(postId);
}

export function* updatePostState(postId) {
    const postToUpdateRef = yield firestore.doc(`posts/${postId}`);
    const postSnapshot = yield postToUpdateRef.get();
    const postData = yield postSnapshot.data();
    yield postData.id = postId;
    yield put(updatePost(postData));
}

export function* deletePost({payload: postId}) {
    yield firestore.doc(`posts/${postId}`).delete();
    yield put(fetchPostsStart());
}

export function* fecthPostsAfertSignIn() {
    yield takeLatest(PostsActionTypes.FETCH_POSTS_START, fetchPosts);
}

export function* onPostUpload() {
    yield takeLatest(PostsActionTypes.UPLOAD_POST_START, uploadPost);
}

export function* onPostLike() {
    yield takeLatest(PostsActionTypes.LIKE_POST, likePost);
}

export function* onPostDislike() {
    yield takeLatest(PostsActionTypes.DISLIKE_POST, dislikePost);
}

export function* onPostComment() {
    yield takeLatest(PostsActionTypes.COMMENT_POST, commentPost);
}

export function* onPostDelete() {
    yield takeLatest(PostsActionTypes.DELETE_POST, deletePost);
}

export function* postsSagas() {
    yield all([call(onPostUpload), call(fecthPostsAfertSignIn), call(onPostLike), call(onPostDislike), call(onPostComment), call(onPostDelete)]);
}