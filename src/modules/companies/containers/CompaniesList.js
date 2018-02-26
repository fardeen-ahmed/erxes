import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { Bulk } from 'modules/common/components';
import { mutations, queries } from '../graphql';
import { TAG_TYPES } from 'modules/tags/constants';
import { CompaniesList } from '../components';
import { COMPANY_INFO } from '../constants';

class CompanyListContainer extends Bulk {
  render() {
    const {
      companiesMainQuery,
      companiesListConfigQuery,
      companyCountsQuery,
      companiesAdd,
      tagsQuery,
      companiesRemove,
      companiesMerge,
      history
    } = this.props;

    let columnsConfig =
      companiesListConfigQuery.fieldsDefaultColumnsConfig || [];

    // load config from local storage
    const localConfig = localStorage.getItem('erxes_company_columns_config');

    if (localConfig) {
      columnsConfig = JSON.parse(localConfig);
    }

    // add company
    const addCompany = ({ doc, callback }) => {
      companiesAdd({
        variables: doc
      })
        .then(() => {
          companiesMainQuery.refetch();
          Alert.success('Success');
          callback();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const removeCompanies = ({ companyIds }) => {
      companiesRemove({
        variables: { companyIds }
      })
        .then(() => {
          this.emptyBulk();
          companiesMainQuery.refetch();
          Alert.success('Success');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const mergeCompanies = ({ ids, data, callback }) => {
      companiesMerge({
        variables: {
          companyIds: ids,
          companyFields: data
        }
      })
        .then(data => {
          Alert.success('Success');
          companiesMainQuery.refetch();
          callback();
          history.push(`/companies/details/${data.data.companiesMerge._id}`);
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const { list = [], totalCount = 0 } =
      companiesMainQuery.companiesMain || {};

    const counts = companyCountsQuery.companyCounts || {
      byBrand: {},
      byIntegrationType: {},
      bySegment: {},
      byTag: {}
    };

    const updatedProps = {
      ...this.props,
      columnsConfig,
      counts: {
        all: totalCount,
        ...counts
      },
      tags: tagsQuery.tags || [],
      searchValue,
      companies: list,
      addCompany,
      loading: companiesMainQuery.loading,
      bulk: this.state.bulk || [],
      emptyBulk: this.emptyBulk,
      toggleBulk: this.toggleBulk,
      toggleAll: this.toggleAll,
      removeCompanies,
      mergeCompanies,
      loadingTags: tagsQuery.loading,
      basicInfos: COMPANY_INFO
    };

    return <CompaniesList {...updatedProps} />;
  }
}

CompanyListContainer.propTypes = {
  queryParams: PropTypes.object,
  companiesMainQuery: PropTypes.object,
  companyCountsQuery: PropTypes.object,
  companiesListConfigQuery: PropTypes.object,
  tagsQuery: PropTypes.object,
  companiesAdd: PropTypes.func,
  loading: PropTypes.bool
};

export default compose(
  graphql(gql(queries.companiesMain), {
    name: 'companiesMainQuery',
    options: ({ queryParams }) => ({
      variables: {
        page: queryParams.page,
        perPage: queryParams.perPage || 20,
        segment: queryParams.segment,
        tag: queryParams.tag,
        ids: queryParams.ids,
        searchValue: queryParams.searchValue
      },
      notifyOnNetworkStatusChange: true
    })
  }),
  graphql(gql(queries.companyCounts), {
    name: 'companyCountsQuery',
    options: ({ queryParams }) => ({
      variables: {
        page: queryParams.page,
        perPage: queryParams.perPage || 20,
        segment: queryParams.segment,
        tag: queryParams.tag,
        ids: queryParams.ids,
        searchValue: queryParams.searchValue
      },
      notifyOnNetworkStatusChange: true
    })
  }),
  graphql(gql(queries.companiesListConfig), {
    name: 'companiesListConfigQuery',
    options: () => ({
      notifyOnNetworkStatusChange: true
    })
  }),
  graphql(gql(queries.tags), {
    name: 'tagsQuery',
    options: () => ({
      variables: {
        type: TAG_TYPES.COMPANY
      },
      notifyOnNetworkStatusChange: true
    })
  }),
  // mutations
  graphql(gql(mutations.companiesAdd), {
    name: 'companiesAdd'
  }),
  graphql(gql(mutations.companiesRemove), {
    name: 'companiesRemove'
  }),
  graphql(gql(mutations.companiesMerge), {
    name: 'companiesMerge'
  })
)(withRouter(CompanyListContainer));
