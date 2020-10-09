import React, {useState} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

import {ReactComponent as ProfileIcon} from '../../assets/profile-icon.svg';
import {ReactComponent as Likes} from '../../assets/likes-feed.svg';
import {ReactComponent as Liked} from '../../assets/liked.svg';
import {ReactComponent as Comments} from '../../assets/comments-feed.svg';

import {Card, CardHeader, CardMedia, CardContent, CardActions, Typography, IconButton, Menu, MenuItem, Modal} from '@material-ui/core';
import {MoreVert} from '@material-ui/icons';
import {makeStyles} from '@material-ui/core/styles';

import ModalBody from '../modal-body/modal-body.component';

import {selectCurrentUserName} from '../../redux/user/user.selectors';
import {likePost, dislikePost} from '../../redux/posts/posts.actions';

const useStyles = makeStyles(theme => ({
    root: {
        width: "90%",
        maxWidth: "614px",
        height: "600px",
        minHeight: "600px",
        minHeight: "600px",
        backgroundColor: theme.palette.common.white,
        border: "1px solid #9ED4FF",
        borderRadius: "1px",
        marginBottom: "30px",
        boxShadow: "none"
    },
    headerTitle: {
        fontSize: "1rem",
        fontWeight: "500"
    },
    headerSubtitle: {
        fontSize: "0.8rem",
        fontWeight: "500"
    },
    headerLink: {
        color: "#333333",
        textDecoration: "none"
    },
    media: {
        height: "410px"
    },
    stat: {
        display: "flex",
        alignItems: "center",
        marginRight: "22px"
    },
    modal: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }
}));

const FeedPost = ({post, currentUserName, likePost, dislikePost}) => {
    const classes = useStyles();
    const {id, uploadedBy, createdAt, image, message, likes, comments} = post;
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [modalContent, setModalContent] = useState(null);

    const handleMenuClick = e => setMenuAnchor(e.currentTarget);
    const handleMenuClose = () => setMenuAnchor(null);

    const handleModalOpen = () => setModalOpen(true);
    const handleModalClose = () => setModalOpen(false);

    const copyPostLink = () => {
        navigator.clipboard.writeText(`sw-social-media.netlify.app/#/post/${id}`);
        handleMenuClose();
    };

    return (
        <>
            <Card className={classes.root}>
                <CardHeader
                    classes={{title: classes.headerTitle, subheader: classes.headerSubtitle}}
                    avatar={<ProfileIcon />}
                    action={<IconButton onClick={handleMenuClick}><MoreVert/></IconButton>}
                    title={<Link className={classes.headerLink} to={`profile/${uploadedBy}`}>{uploadedBy}</Link>}
                    subheader={new Date(createdAt.seconds * 1000).toLocaleDateString()}
                />
                <Menu anchorEl={menuAnchor} getContentAnchorEl={null} anchorOrigin={{vertical: "top", horizontal: "right"}} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
                    <MenuItem onClick={copyPostLink}>Copy Link</MenuItem>
                </Menu>
                <CardMedia className={classes.media} image={image} />
                <CardContent>
                    <Typography style={{color: "#333333"}} variant="body1">{message}</Typography>
                </CardContent>
                <CardActions>
                    <div className={classes.stat}>
                        {
                            likes.includes(currentUserName) ? (
                                <IconButton onClick={() => dislikePost({currentUserName, id})}>
                                    <Liked />
                                </IconButton>
                            ) : (
                                <IconButton onClick={() => likePost({currentUserName, id})}>
                                    <Likes />
                                </IconButton>
                            )
                        }
                        <Typography style={{cursor: "pointer", color: "#333333"}} variant="body1" onClick={() => {setModalType('Likes'); setModalContent(likes); handleModalOpen();}}>{likes.length}</Typography>
                    </div>
                    <div className={classes.stat}>
                        <IconButton>
                            <Comments />
                        </IconButton>
                        <Typography style={{cursor: "pointer", color: "#333333"}} variant="body1" onClick={() => {setModalType('comments'); setModalContent(comments); handleModalOpen();}}>{comments.length}</Typography>
                    </div>
                </CardActions>
            </Card>
            <Modal className={classes.modal} open={modalOpen} onClose={handleModalClose}>
                <div style={{outline: "none"}}>
                    <ModalBody zoomin={modalOpen} type={modalType} content={modalContent} handleModalClose={handleModalClose}/>
                </div>
            </Modal>
        </>
    );
};

const mapStateToProps = (state, ownProps) => ({
    currentUserName: selectCurrentUserName(state)
});

const mapDispatchToProps = dispatch => ({
    likePost: likeData => dispatch(likePost(likeData)),
    dislikePost: dislikeData => dispatch(dislikePost(dislikeData))
});

export default connect(mapStateToProps, mapDispatchToProps)(FeedPost);