import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';

import {Box, Avatar, Typography, IconButton, Button, Menu, MenuItem, Modal, Grid} from '@material-ui/core';
import {MoreVert} from '@material-ui/icons';
import {makeStyles} from '@material-ui/core/styles';

import ModalBody from '../../components/modal-body/modal-body.component';
import Loader from '../../components/loader/loader.component';

import {followUserStart, unfollowUserStart} from '../../redux/user/user.actions';
import {selectCurrentUser} from '../../redux/user/user.selectors';

import {fetchUserProfile} from '../../firebase/firebase';

const useStyles = makeStyles( theme => ({
    userPanel: {
        padding: "0 30px",
        [theme.breakpoints.down('md')]: {
            padding: "0 10px"
        }
    },
    avatar: {
        width: "85px",
        height: "85px",
        marginRight: "32px",
        [theme.breakpoints.down('md')]: {
            marginRight: "12px"
        }
    },
    profileUserName: {
        fontSize: "1.2rem"
    },
    profilePanel: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "space-between",
        height: "100%",
        cursor: "pointer",
        [theme.breakpoints.down('md')]: {
            marginRight: "5px"
        }
    },
    panelNumber: {
        fontSize: "1.2rem"
    },
    iconButton: {
        marginLeft: "auto"
    },
    modal: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    imageBox: {
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        cursor: "pointer"
    },
    followButton: {
        width: "105px",
        height: "30px",
        marginLeft: "auto"
    },
    menuItem: {
        fontSize: "0.9rem",
        padding: "7px 25px"
    },
    postsGrid: {
        [theme.breakpoints.down('md')]: {
            justifyContent: "center"
        }
    }
}));

const ProfilePage = ({match, history, currentUser, followUser, unfollowUser}) => {
    const classes = useStyles();

    const [profileData, setProfileData] = useState(null);
    const [followData, setFollowData] = useState(null);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [modalContent, setModalContent] = useState(null);

    useEffect(() => {
        async function fetchProfile() {
            const profileUser = await fetchUserProfile(match.params.userName);
            setProfileData(profileUser);
            setFollowData({
                profileId: profileUser.id,
                profileDisplayName: profileUser.displayName,
                currentUserId: currentUser.id,
                currentUserDisplayName: currentUser.displayName
            });
        }
        fetchProfile();
    }, [match]);

    const handleMenuClick = e => setMenuAnchor(e.currentTarget);
    const handleMenuClose = () => setMenuAnchor(null);

    const handleModalOpen = () => setModalOpen(true);
    const handleModalClose = () => setModalOpen(false);

    const handleModalChange = (type, content, menuClose) => {
        setModalType(type);
        setModalContent(content);
        handleModalOpen();
        if (menuClose) handleMenuClose();
    };

    return (
        <>
            {
                profileData ? (
                    <Box width="100%" height="100%" display="flex" flexDirection="column" alignItems="center" paddingTop="130px">
                        <Box display="flex" flexDirection="column" alignItems="center" width="95%" maxWidth="770px" height="100%">
                            <Box className={classes.userPanel} display="flex" alignItems="flex-start" width="100%" height="110px" border={1} borderLeft={0} borderTop={0} borderRight={0} borderColor="secondary.main">
                                <Avatar className={classes.avatar} src={profileData.avatar}></Avatar>
                                <Box display="flex" flexDirection="column" alignItems="flex-start" justifyContent="space-between" width="55%" height="100%" paddingBottom="20px">
                                    <Typography className={classes.profileUserName} variant="h6" style={{color: "#333333"}}>{profileData.displayName}</Typography>
                                    <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" height="40px">
                                        <div className={classes.profilePanel}>
                                            <Typography className={classes.panelNumber} variant="body1" color="primary">{profileData.posts.length}</Typography>
                                            <Typography variant="subtitle2" style={{color: "#777777"}}>Posts</Typography>
                                        </div>
                                        <div className={classes.profilePanel} onClick={() => handleModalChange("Followers", profileData.followers)}>
                                            <Typography className={classes.panelNumber} variant="body1" color="primary">{profileData.followers.length}</Typography>
                                            <Typography variant="subtitle2" style={{color: "#777777"}}>Followers</Typography>
                                        </div>
                                        <div className={classes.profilePanel} onClick={() => handleModalChange("Following", profileData.following)}>
                                            <Typography className={classes.panelNumber} variant="body1" color="primary">{profileData.following.length}</Typography>
                                            <Typography variant="subtitle2" style={{color: "#777777"}}>Following</Typography>
                                        </div>
                                    </Box>
                                </Box>
                                {
                                    profileData.id === currentUser.id ? (
                                        <IconButton className={classes.iconButton} onClick={handleMenuClick}>
                                            <MoreVert />
                                        </IconButton>
                                    ) : (
                                        currentUser.following.includes(profileData.displayName) ? (
                                            <Button className={classes.followButton} variant="contained" color="primary" onClick={() => unfollowUser(followData)}>Unfollow</Button>
                                        ) : (
                                            <Button className={classes.followButton} variant="contained" color="secondary" onClick={() => followUser(followData)}>Follow</Button>
                                        )
                                    )
                                }
                            </Box>
                            <Box width="100%" paddingTop="15px">
                                <Grid className={classes.postsGrid} container spacing={1}>
                                {
                                    profileData.posts.map(post => (
                                        <Grid item xs={"auto"} xl={3} key={post.id}>
                                            <Box onClick={() => history.push(`/post/${post.id}`)} className={classes.imageBox} style={{backgroundImage: `url(${post.image})`}} width="250px" height="250px" border={1} borderRadius={1} borderColor="secondary.main"/>
                                        </Grid>
                                    ))
                                }
                                </Grid>
                            </Box>
                        </Box>
                        <Menu anchorEl={menuAnchor} getContentAnchorEl={null} anchorOrigin={{vertical: "center", horizontal: "right"}} transformOrigin={{vertical: "top", horizontal: "left"}} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
                            <MenuItem classes={{root: classes.menuItem}} onClick={() => handleModalChange("change-password", null, 1)}>Change Password</MenuItem>
                            <MenuItem classes={{root: classes.menuItem}} onClick={() => handleModalChange("delete-account", null, 1)}>Delete Account</MenuItem>
                        </Menu>
                        <Modal className={classes.modal} open={modalOpen} onClose={handleModalClose}>
                            <div style={{outline: "none"}}>
                                <ModalBody zoomin={modalOpen} type={modalType} content={modalContent} currentUserName={currentUser.displayName} currentUserId={currentUser.id} handleModalClose={handleModalClose} />
                            </div>
                        </Modal>
                    </Box>
                ) : (
                    <Loader backdropOpen={!Boolean(profileData)} />
                )
            }
        </>
    );
};

const mapStateToProps = createStructuredSelector({
    currentUser: selectCurrentUser
});

const mapDispatchToProps = dispatch => ({
    followUser: followData => dispatch(followUserStart(followData)),
    unfollowUser: followData => dispatch(unfollowUserStart(followData))
});

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage);