import React from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import moment from 'moment';

import Card from '@material-ui/core/Card';
import MenuIcon from '@material-ui/icons/Menu';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import {
  Paper,
  CardActions,
  CardActionArea,
  CircularProgress,
  Typography,
  Popper,
  Grow,
  ClickAwayListener,
  MenuItem,
  MenuList,
} from '@material-ui/core';

import Layout from '../components/Layout';

export default class extends React.PureComponent {
  state = {
    timer: 0,
    isRunning: false,
    popperOpen: null,
  };

  componentWillUnmount() {
    this.stopTimer();
  }

  startTimer = () => {
    this.setState({ isRunning: true });
    this.timer = setInterval(() => {
      const { timer } = this.state;
      this.setState({ timer: timer + 100 });
    }, 100);
  };

  stopTimer = () => {
    this.setState({ isRunning: false });
    clearInterval(this.timer);
  };

  handleClosePopper = () => {
    this.setState({
      popperOpen: null,
    });
  };

  render() {
    const { timer, isRunning, popperOpen } = this.state;
    const { navigate } = this.props;
    return (
      <Layout title="Home">
        <div>
          <Query query={GET_RACE}>
            {({ data, loading, error }) => {
              if (loading) {
                return (
                  <Grid
                    container
                    justify="center"
                    style={{ marginTop: 24 }}
                  >
                    <CircularProgress />
                  </Grid>
                );
              }
              if (error) {
                return <p>Error: {error.message}</p>;
              }

              return (
                <>
                  <Typography
                    align="center"
                    variant="h2"
                    color="textSecondary"
                  >
                    {moment(
                      (data.mostRecentRace.currentTime ||
                        0) + timer,
                    ).format('mm:ss')}
                  </Typography>
                  <Mutation
                    mutation={UPDATE_RACE}
                    variables={{
                      id: data.mostRecentRace._id,
                      currentTime:
                        timer +
                        (data.mostRecentRace.currentTime ||
                          0),
                    }}
                    refetchQueries={[{ query: GET_RACE }]}
                    awaitRefetchQueries
                    onCompleted={() =>
                      this.setState({ timer: 0 })
                    }
                  >
                    {updateRace => (
                      <Grid container justify="center">
                        {isRunning ? (
                          <Button
                            onClick={() => {
                              this.stopTimer();
                              updateRace();
                            }}
                            color="secondary"
                          >
                            Stop
                          </Button>
                        ) : (
                          <Button
                            onClick={this.startTimer}
                            color="primary"
                          >
                            Start
                          </Button>
                        )}
                      </Grid>
                    )}
                  </Mutation>
                  <Typography
                    align="center"
                    gutterBottom
                    variant="h5"
                  >
                    Racers
                  </Typography>
                  <Mutation
                    mutation={DELETE_RACER}
                    variables={{
                      raceId: data.mostRecentRace._id,
                      racerId: popperOpen,
                    }}
                    update={updateCacheAfterDelete(
                      popperOpen,
                    )}
                    onCompleted={() => {
                      this.handleClosePopper();
                    }}
                  >
                    {deleteRacer => (
                      <Grid container spacing={8}>
                        {data.mostRecentRace.racers &&
                          data.mostRecentRace.racers
                            .sort(
                              (a, b) =>
                                a.mostRecentLap.time >
                                b.mostRecentLap.time
                                  ? 1
                                  : -1,
                            )
                            .map(racer => (
                              <Grid
                                item
                                key={racer._id}
                                xs={6}
                                style={{
                                  position: 'relative',
                                }}
                              >
                                <Card
                                  style={{
                                    transition:
                                      'opacity 0.2s',
                                    opacity:
                                      popperOpen !== null &&
                                      popperOpen !==
                                        racer._id
                                        ? 0.15
                                        : 1,
                                  }}
                                >
                                  <Popper
                                    open={
                                      popperOpen ===
                                      racer._id
                                    }
                                    anchorEl={this.anchorEl}
                                    transition
                                    disablePortal
                                    style={{
                                      zIndex: 10,
                                      position: 'absolute',
                                      top: '100%',
                                    }}
                                  >
                                    {({
                                      TransitionProps,
                                    }) => (
                                      <Grow
                                        {...TransitionProps}
                                        id="menu-list-grow"
                                      >
                                        <Paper>
                                          <ClickAwayListener
                                            onClickAway={
                                              this
                                                .handleClosePopper
                                            }
                                          >
                                            <MenuList>
                                              <MenuItem
                                                onClick={
                                                  deleteRacer
                                                }
                                              >
                                                Delete Racer
                                              </MenuItem>

                                              <Mutation
                                                mutation={
                                                  UNDO_LAP
                                                }
                                                variables={{
                                                  racerId:
                                                    racer._id,
                                                }}
                                                onCompleted={
                                                  this
                                                    .handleClosePopper
                                                }
                                                update={updateCacheAfterUndoLap(
                                                  racer._id,
                                                )}
                                              >
                                                {undoLap => (
                                                  <>
                                                    {racer
                                                      .mostRecentLap
                                                      .number >
                                                      1 && (
                                                      <MenuItem
                                                        onClick={
                                                          undoLap
                                                        }
                                                      >
                                                        Undo
                                                        Lap
                                                      </MenuItem>
                                                    )}
                                                  </>
                                                )}
                                              </Mutation>
                                            </MenuList>
                                          </ClickAwayListener>
                                        </Paper>
                                      </Grow>
                                    )}
                                  </Popper>
                                  <Mutation
                                    mutation={NEW_LAP}
                                    variables={{
                                      racerId: racer._id,
                                      number:
                                        racer.mostRecentLap
                                          .number + 1,
                                      time:
                                        timer +
                                        (data.mostRecentRace
                                          .currentTime ||
                                          0),
                                    }}
                                    update={updateCacheAfterNewLap(
                                      racer._id,
                                    )}
                                  >
                                    {newLap => {
                                      const submitNewLap = () =>
                                        newLap({
                                          optimisticResponse: {
                                            addLap: {
                                              number:
                                                racer
                                                  .mostRecentLap
                                                  .number +
                                                1,
                                              time:
                                                timer +
                                                (data
                                                  .mostRecentRace
                                                  .currentTime ||
                                                  0),
                                              __typename:
                                                'RecentLap',
                                            },
                                          },
                                        });
                                      return (
                                        <>
                                          <CardActionArea
                                            onClick={
                                              submitNewLap
                                            }
                                          >
                                            <CardHeader
                                              title={
                                                racer.sailNumber
                                              }
                                              subheader={`Lap ${
                                                racer
                                                  .mostRecentLap
                                                  .number
                                              } (${moment(
                                                racer
                                                  .mostRecentLap
                                                  .time,
                                              ).format(
                                                'mm:ss',
                                              )})`}
                                            />
                                          </CardActionArea>
                                          <CardActions>
                                            <Grid
                                              container
                                              justify="space-between"
                                            >
                                              <Button
                                                style={{
                                                  height: 40,
                                                }}
                                                variant="outlined"
                                                size="small"
                                                onClick={
                                                  submitNewLap
                                                }
                                              >
                                                Lap
                                              </Button>
                                              <Button
                                                style={{
                                                  height: 40,
                                                }}
                                                variant="outlined"
                                                size="small"
                                                disabled={
                                                  popperOpen ===
                                                  racer._id
                                                }
                                                onClick={() =>
                                                  this.setState(
                                                    {
                                                      popperOpen:
                                                        racer._id,
                                                    },
                                                  )
                                                }
                                              >
                                                <MenuIcon color="inherit" />
                                              </Button>
                                            </Grid>
                                          </CardActions>
                                        </>
                                      );
                                    }}
                                  </Mutation>
                                </Card>
                              </Grid>
                            ))}
                      </Grid>
                    )}
                  </Mutation>
                  {!isRunning && (
                    <Grid container justify="center">
                      <Button
                        onClick={() => navigate('addRacer')}
                      >
                        Add Racer
                      </Button>
                    </Grid>
                  )}
                </>
              );
            }}
          </Query>
        </div>
      </Layout>
    );
  }
}

export const GET_RACE = gql`
  {
    mostRecentRace {
      _id
      currentTime
      racers {
        _id
        sailNumber
        mostRecentLap {
          time
          number
        }
      }
    }
  }
`;

export const UPDATE_RACE = gql`
  mutation UpdateRace($id: ID!, $currentTime: Int) {
    updateRace(id: $id, currentTime: $currentTime) {
      _id
    }
  }
`;

export const DELETE_RACER = gql`
  mutation DeleteRacer($racerId: ID!, $raceId: ID!) {
    deleteRacer(racerId: $racerId, raceId: $raceId)
  }
`;

export const NEW_LAP = gql`
  mutation NewLap(
    $racerId: ID!
    $number: Int!
    $time: Int!
  ) {
    addLap(
      racerId: $racerId
      number: $number
      time: $time
    ) {
      _id
      time
      number
    }
  }
`;

export const UNDO_LAP = gql`
  mutation UndoLap($racerId: ID!) {
    undoLap(racerId: $racerId) {
      _id
      sailNumber
      mostRecentLap {
        time
        number
      }
    }
  }
`;

const updateCacheAfterNewLap = racerId => (
  cache,
  {
    data: {
      addLap: { time, number },
    },
  },
) => {
  const { mostRecentRace } = cache.readQuery({
    query: GET_RACE,
  });
  mostRecentRace.racers = mostRecentRace.racers.map(
    cachedRacer => {
      if (cachedRacer._id !== racerId) {
        return cachedRacer;
      }
      return {
        ...cachedRacer,
        mostRecentLap: {
          time,
          number,
          __typename: 'RecentLap',
        },
      };
    },
  );
  cache.writeQuery({
    query: GET_RACE,
    data: {
      mostRecentRace,
    },
  });
};

const updateCacheAfterDelete = racerId => cache => {
  const { mostRecentRace } = cache.readQuery({
    query: GET_RACE,
  });
  cache.writeQuery({
    query: GET_RACE,
    data: {
      mostRecentRace: {
        ...mostRecentRace,
        racers: mostRecentRace.racers.filter(
          ({ _id }) => _id !== racerId,
        ),
      },
    },
  });
};

const updateCacheAfterUndoLap = racerId => (
  cache,
  { data },
) => {
  const { mostRecentRace } = cache.readQuery({
    query: GET_RACE,
  });
  cache.writeQuery({
    query: GET_RACE,
    data: {
      mostRecentRace: {
        ...mostRecentRace,
        racers: mostRecentRace.racers.map(racer => {
          if (racer.racerId !== racerId) {
            return racer;
          }
          return {
            ...racer,
            ...data,
          };
        }),
      },
    },
  });
};
