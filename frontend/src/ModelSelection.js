import React from "react";
import { Container, Grid, IconButton, Typography, AppBar, Toolbar, Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import PlantIcon1 from "./plantIcons/PlantIcon1.png";
import PlantIcon2 from "./plantIcons/PlantIcon2.png";
import PlantIcon3 from "./plantIcons/PlantIcon3.png";
import PlantIcon4 from "./plantIcons/PlantIcon4.png";
import backgroundImage from "./backgroundImage.png";
import cblogo from "./logo.PNG";

const useStyles = makeStyles((theme) => ({
  appbar: {
    background: '#3366ff',
    boxShadow: 'none',
    color: 'white'
  },
  grow: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
    textAlign: 'left',
    fontWeight: 'Open Sans',
    color: 'white', 
  },
  header: {
    marginBottom: theme.spacing(2),
    color: 'white',
    textAlign: 'center',
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: theme.spacing(2),
  },
  mainContainer: {
    backgroundImage: `url(${backgroundImage})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: theme.spacing(4),
  },
  plantIcon: {
    width: 150, 
    height: 150, 
  },
}));

const ModelSelection = () => {
  const classes = useStyles();
  const navigate = useNavigate(); // Initialize useNavigate

  const handleModelSelect = (modelId) => {
    navigate(`/image-upload/${modelId}`); // Navigate to ImageUpload with selected model
  };

  return (
    <React.Fragment>
      <AppBar position="static" className={classes.appbar}>
        <Toolbar>
          <Typography className={classes.title} variant="h6" noWrap>
              Plant Diseases Detection
          </Typography>
          <div className={classes.grow} />
          <Avatar src={cblogo}></Avatar>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" className={classes.mainContainer}>
        <Grid container spacing={2} justifyContent="center" alignItems="flex-start" className={classes.buttonContainer}>
          <Grid item xs={12} className={classes.header}>
            <Typography variant="h5">
              Choose Your Plant 
            </Typography>
          </Grid>
          <Grid item>
            <IconButton className={classes.circularButton} onClick={() => handleModelSelect("model1")} aria-label="model1">
              <img src={PlantIcon1} alt="Model 1" className={classes.plantIcon} />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton className={classes.circularButton} onClick={() => handleModelSelect("model2")} aria-label="model2">
              <img src={PlantIcon2} alt="Model 2" className={classes.plantIcon} />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton className={classes.circularButton} onClick={() => handleModelSelect("model3")} aria-label="model3">
              <img src={PlantIcon3} alt="Model 3" className={classes.plantIcon} />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton className={classes.circularButton} onClick={() => handleModelSelect("model4")} aria-label="model4">
              <img src={PlantIcon4} alt="Model 4" className={classes.plantIcon} />
            </IconButton>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
};

export default ModelSelection;
