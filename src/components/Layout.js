import React from 'react';
import PropTypes from 'prop-types';

import './defaults.css';
import MenuIcon from '@material-ui/icons/Menu';
import InboxIcon from '@material-ui/icons/Inbox';
import MailIcon from '@material-ui/icons/Mail';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@material-ui/core';
import { Link } from 'gatsby';

class Layout extends React.PureComponent {
  state = {
    drawerOpen: false,
  };

  render() {
    const { children, title } = this.props;
    const { drawerOpen } = this.state;
    return (
      <React.Fragment>
        <Drawer
          open={drawerOpen}
          onClose={() =>
            this.setState({ drawerOpen: false })
          }
        >
          <div style={{ width: 250 }}>
            <List>
              {[
                ['Home', '/'],
                ['Sounds', '/sounds'],
                ['User', '/user'],
              ].map(([text, link], index) => (
                <Link key={text} to={link}>
                  <ListItem button>
                    <ListItemIcon>
                      {index % 2 === 0 ? (
                        <InboxIcon />
                      ) : (
                        <MailIcon />
                      )}
                    </ListItemIcon>
                    <ListItemText primary={text} />
                  </ListItem>
                </Link>
              ))}
            </List>
          </div>
        </Drawer>
        <AppBar position="fixed">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={() =>
                this.setState({ drawerOpen: true })
              }
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" noWrap>
              {title || 'Unknown Title'}
            </Typography>
          </Toolbar>
        </AppBar>
        <div style={{ padding: '1rem', marginTop: '56px' }}>
          {children}
        </div>
      </React.Fragment>
    );
  }
}

Layout.propTypes = {
  children: PropTypes.any.isRequired,
  title: PropTypes.string.isRequired,
};

export default Layout;
