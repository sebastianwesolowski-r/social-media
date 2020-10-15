import React, {useState} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

import {ReactComponent as UploadIcon} from '../../assets/upload-comment.svg';

import {Typography, List, ListItem, ListItemAvatar, ListItemText, Paper, Button, InputBase, Zoom} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';

import {commentPost} from '../../redux/posts/posts.actions';

const useStyles  = makeStyles(theme => ({
    root: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        width: "400px",
        height: "500px",
        backgroundColor: theme.palette.common.white,
        borderRadius: "5px",
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "400px",
        minHeight: "50px",
        height: "50px",
        color: theme.palette.grey[50],
        backgroundColor: props => props.warning ? theme.palette.error.dark : theme.palette.primary.main,
        borderRadius: "5px 5px 0 0",
    },
    list: {
        width: "100%",
        paddingTop: "12px",
        overflowX: "hidden",
        overflowY: "auto",
        "&::-webkit-scrollbar": {
            width: "8px"
        },
        "&::-webkit-scrollbar-track": {
            background: theme.palette.grey[400],
            boxShadow: "inset 0 0 5px #D3D3D3"
        },
        "&::-webkit-scrollbar-thumb": {
            background: theme.palette.secondary.main
        }
    },
    link: {
        color: "#333333",
        textDecoration: "none"
    },
    uploadComment: {
        display: "flex",
        alignItems: "center",
        width: "400px",
        height: "55px",
        backgroundColor: theme.palette.grey[300],
        marginTop: "auto",
        borderRadius: "0 0 5px 5px",
        borderTop: `1px solid ${theme.palette.secondary.main}`
    },
    uploadCommentInput: {
        width: "100%",
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: "20px",
        color: "#333333",
        "& ::-webkit-input-placeholder": {
            color: theme.palette.primary.main
        }
    },
    uploadCommentBtn: {
        width: "40px",
        height: "30px",
        margin: theme.spacing(0, 2)
    }
}));

const ModalBody = ({type, content, zoomin, currentUserName, postId, handleModalClose, commentPost}) => {
    const classes = useStyles();

    const [comment, setComment] = useState('');

    const handleCommentChange = e => {
        setComment(e.target.value);
    };

    const handleCommentPost = e => {
        e.preventDefault();
        commentPost({postId, currentUserName, comment});
        handleModalClose();
    }

    const renderSwitch = type => {
        switch(type) {
            case 'Likes':
            case 'Followers':
            case 'Following':
                return (
                    <div className={classes.root}>
                        <div className={classes.header}><Typography variant="h6">{type}</Typography></div>
                        <List className={classes.list}>
                            {
                                content.map(item => (
                                    <ListItem key={item}>
                                        <ListItemAvatar><div /></ListItemAvatar>
                                        <ListItemText primary={<Link className={classes.link} to={`/profile/${item}`} onClick={handleModalClose}>{item}</Link>}/>
                                    </ListItem>
                                ))
                            }
                        </List>
                    </div>
                );
            case 'comments': return (
                <div className={classes.root}>
                    <div className={classes.header}><Typography variant="h6">Comments</Typography></div>
                    <List className={classes.list}>
                        {
                            content.map(item => (
                                <ListItem key={`${item.commentedBy}${item.commentContent}`}>
                                    <ListItemAvatar><div /></ListItemAvatar>
                                    <ListItemText primary={<Link className={classes.link} to={`/profile/${item.commentedBy}`} onClick={handleModalClose}>{item.commentedBy}</Link>} secondary={item.commentContent} />
                                </ListItem>
                            ))
                        }
                    </List>
                    <Paper component="form" onSubmit={handleCommentPost} className={classes.uploadComment}>
                        <InputBase className={classes.uploadCommentInput} value={comment} onChange={handleCommentChange} placeholder="Write a comment..." required/>
                        <Button className={classes.uploadCommentBtn} variant="contained" color="primary" type="submit"><UploadIcon /></Button>
                    </Paper>
                </div>
            );
            default: return;
        }
    }

    return (
        <Zoom in={zoomin}>
            {
                renderSwitch(type)
            }
        </Zoom>
    );
};

const mapDispatchToProps = dispatch => ({
    commentPost: commentData => dispatch(commentPost(commentData))
})

export default connect(null, mapDispatchToProps)(ModalBody);