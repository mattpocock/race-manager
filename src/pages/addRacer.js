import React from 'react';
import PropTypes from 'prop-types';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import {
  CircularProgress,
  TextField,
} from '@material-ui/core';

import Layout from '../components/Layout';
import { GET_RACE } from '.';

class AddRacer extends React.PureComponent {
  state = {
    sailNumber: '',
  };

  render() {
    const { sailNumber } = this.state;
    const { navigate } = this.props;
    return (
      <Layout title="Add Racer">
        <Query query={GET_RACE_ID}>
          {({ loading, error, data }) => {
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
              <Mutation
                mutation={ADD_RACER}
                variables={{
                  raceId: data.mostRecentRace._id,
                  sailNumber,
                }}
                update={(cache, { data: { addRacer } }) => {
                  const {
                    mostRecentRace,
                  } = cache.readQuery({ query: GET_RACE });
                  cache.writeQuery({
                    query: GET_RACE,
                    data: {
                      mostRecentRace: {
                        ...mostRecentRace,
                        racers: [
                          ...mostRecentRace.racers,
                          addRacer,
                        ],
                      },
                    },
                  });
                }}
                onCompleted={() => {
                  navigate('/');
                }}
              >
                {(
                  submit,
                  { loading: mutationIsLoading },
                ) => (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      submit();
                    }}
                  >
                    <TextField
                      name="sailNumber"
                      label="Sail Number"
                      fullWidth
                      onChange={e =>
                        this.setState({
                          sailNumber: e.target.value,
                        })
                      }
                    />
                    <Grid container justify="center">
                      {mutationIsLoading ? (
                        <CircularProgress
                          style={{ marginTop: 16 }}
                        />
                      ) : (
                        <>
                          <Grid item>
                            <Button
                              onClick={() => navigate('/')}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={!sailNumber}
                            >
                              Submit
                            </Button>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </form>
                )}
              </Mutation>
            );
          }}
        </Query>
      </Layout>
    );
  }
}

AddRacer.propTypes = {
  navigate: PropTypes.func.isRequired,
};

export default AddRacer;

const GET_RACE_ID = gql`
  {
    mostRecentRace {
      _id
    }
  }
`;

const ADD_RACER = gql`
  mutation AddRacer($sailNumber: String!, $raceId: ID!) {
    addRacer(sailNumber: $sailNumber, raceId: $raceId) {
      _id
      sailNumber
      lapIds
      mostRecentLap {
        time
        number
      }
    }
  }
`;
