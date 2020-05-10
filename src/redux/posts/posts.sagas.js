import {takeLatest, all, put, call} from 'redux-saga/effects';

import PostsActionTypes from './posts.types';

import {storage, firestore, convertPostsSnapshotToMap, createPost} from '../../firebase/firebase';

import {uploadPostSuccess, uploadPostFailure, fetchPostsStart, fetchPostsSuccess, fetchPostsFailure} from './posts.actions';

export function* fetchPosts() {
    try {
        const postsRef = firestore.collection('posts');
        const snapshot = yield postsRef.get();
        const postsMap = yield call(convertPostsSnapshotToMap, snapshot);
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
                throw new Error('Image size is too big');
            }
            yield storage.ref(`postImages/${postImage.name}`).put(postImage);
            imageUrl = yield storage.ref("postImages").child(postImage.name).getDownloadURL();
        }
        yield call(createPost, postMessage, currentUserName, imageUrl);
        yield put(fetchPostsStart());
        yield put(uploadPostSuccess());
    } catch(error) {
        yield put(uploadPostFailure(error));
    }
}

export function* onFetchPostsStart() {
    yield takeLatest(PostsActionTypes.FETCH_POSTS_START, fetchPosts);
}

export function* onPostUpload() {
    yield takeLatest(PostsActionTypes.UPLOAD_POST_START, uploadPost);
}

export function* postsSagas() {
    yield all([call(onPostUpload), call(onFetchPostsStart)]);
}