import React, { Component } from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {
  Tabs,
  Tab
} from '@material-ui/core';

import {
  GET_FEES,
  FEES_UPDATED
} from '../../constants'

import Issue from "../issue";
import List from "../list";
import Swap from "../swap";
import ErrorSnackbar from '../errorSnackbar';

import Store from "../../stores";
const dispatcher = Store.dispatcher
const emitter = Store.emitter
const store = Store.store

const styles = theme => ({
  root: {
    minHeight: '450px'
  },
  tabs: {
    marginTop: '24px',
    marginBottom: '24px'
  }
});

class Controller extends Component {
  state = {
    tabValue: 0,
    issueOpen: false,
    issueFee: 0,
    error: '',
    errorOpen: false
  };

  componentWillMount() {
    emitter.on(FEES_UPDATED, this.feesUpdated);
    dispatcher.dispatch({type: GET_FEES, content: {} })
  };

  componentWillUnmount() {
    emitter.removeListener(FEES_UPDATED, this.feesUpdated);
  };

  feesUpdated = () => {
    const fees = store.getStore('fees')

    let issueFee = fees.filter((fee) => {
      return fee.msg_type === 'issueMsg'
    }).map((fee) => {
      return fee.fee/100000000
    })[0]

    this.setState({
      fees,
      issueFee: issueFee
    })
  };

  handleChange = (event, value) => {
    this.setState({ tabValue: value });
  };

  onIssue = (event) => {
    this.setState({ issueOpen: true })
  };

  onIssueBack = (event) => {
    this.setState({ issueOpen: false })
  };

  render() {
    const { classes } = this.props;
    const {
      issueOpen,
      errorOpen
    } = this.state;

    return (
      <div className={ classes.root }>
        { !issueOpen && this.renderTabs() }
        { issueOpen && this.renderIssue() }
        { errorOpen && this.renderError() }
      </div>
    )
  };

  renderError = () => {
    return (
      <ErrorSnackbar error={ this.state.error } handleClose={ this.handleErrorClose } open={ this.state.errorOpen }  />
    )
  };

  handleErrorClose = () => {
    this.setState({ errorOpen: false, error: null })
  };

  showError = (error) => {
    this.setState({ errorOpen: true, error: error })
  };

  renderIssue = () => {
    const {
      issueFee
    } = this.state

    return(
      <Issue onBack={ this.onIssueBack }  issueFee={ issueFee } showError={ this.showError } />
    )
  };

  renderTabs = () => {
    const { classes } = this.props;
    const {
      tabValue
    } = this.state;

    return (
      <React.Fragment>
        <Tabs value={tabValue} onChange={this.handleChange} className={ classes.tabs } variant="fullWidth" indicatorColor="primary" textColor="inherit">
          <Tab label="Swap" />
          <Tab label="List" />
        </Tabs>
        {tabValue === 0 && <Swap onIssue={ this.onIssue } showError={ this.showError } />}
        {tabValue === 1 && <List onIssue={ this.onIssue } showError={ this.showError } />}
      </React.Fragment>
    )
  };
}

Controller.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Controller);