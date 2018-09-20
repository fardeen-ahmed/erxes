import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { ContentBox } from 'modules/settings/styles';
import React, { Component } from 'react';

type Props = {
  save: (params: { name: string }) => void;
};

class Calendar extends Component<Props> {
  constructor(props: Props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.save({
      name: (document.getElementById('name') as HTMLInputElement).value
    });
  }

  render() {
    const content = (
      <ContentBox>
        <form onSubmit={this.handleSubmit}>
          <FormGroup>
            <ControlLabel>Name</ControlLabel>

            <FormControl id="name" type="text" required />
          </FormGroup>

          <ModalFooter>
            <Button btnStyle="success" type="submit" icon="checked-1">
              Save
            </Button>
          </ModalFooter>
        </form>
      </ContentBox>
    );

    const breadcrumb = [
      { title: __('Settings'), link: '/settings/integrations' },
      { title: __('Integrations') }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        content={content}
      />
    );
  }
}

export default Calendar;
