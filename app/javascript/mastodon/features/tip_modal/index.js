import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import Button from 'mastodon/components/button';
import Icon from 'mastodon/components/icon';
import { closeModal } from 'mastodon/actions/modal';
import { directCompose } from 'mastodon/actions/compose';

const mapStateToProps = (state, { accountId }) => ({
  displayNameHtml: state.getIn(['accounts', accountId, 'display_name_html']),
});

const mapDispatchToProps = (dispatch) => ({
  onDirect (account, router) {
    dispatch(closeModal());
    dispatch(directCompose(account, router));
  },
  onTipClick (url) {
    dispatch(closeModal('TIP'));
    window.open(url);
    //dispatch(directCompose(account, router));
  },
});

export default @connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })
@(component => injectIntl(component, { withRef: true }))
class TipModal extends React.PureComponent {

  static contextTypes = {
    router: PropTypes.object,
  };

  static propTypes = {
    status: ImmutablePropTypes.map.isRequired,
    displayNameHtml: PropTypes.string,
    type: PropTypes.oneOf(['givetip', 'invitetip']),
    onDirect: PropTypes.func,
    onTipClick: PropTypes.func,
  };

  handleTipClick = url => () => {
    this.props.onTipClick(url);
  };

  handleDirectClick = () => {
    this.props.onDirect(this.props.status.get('account'), this.context.router.history);
  }

  render () {
    const { type, displayNameHtml } = this.props;

    const name = <bdi dangerouslySetInnerHTML={{ __html: displayNameHtml }} />;

    let tipButton, title, actionDescription, icon;

    const myFields = this.props.status.get('account').get('fields');
    const addressField = myFields.find(e => e.get('name') === 'reddcoin');
    let uriText;
    if (addressField) {
      uriText = `${addressField.get('name')}:${addressField.get('value')}`;
    }

    switch(type) {
    case 'givetip':
      icon = <Icon id='btc' />;
      title = <FormattedMessage id='tip_modal.title.tip' defaultMessage="Tip {name}'s post" values={{ name }} />;
      actionDescription = <FormattedMessage id='tip_modal.description.tip' defaultMessage='With a Reddcoin wallet address, you can tip this post and reward the author.' />;
      tipButton = (
        <Button className='button button--block' active title='Tip' onClick={this.handleTipClick(uriText)}>
          <FormattedMessage id='tip_modal.tip_name' defaultMessage='Tip {name}' values={{ name }} />
        </Button>
      );
      break;
    case 'invitetip':
      icon = <Icon id='envelope' />;
      title = <FormattedMessage id='tip_modal.title.invite' defaultMessage='Invite {name} to use Reddcoin' values={{ name }} />;
      actionDescription = <FormattedMessage id='tip_modal.description.invite' defaultMessage='{name} doesnt seem to have a Reddcoin address configured in their profile. Invite {name} to Reddcoin so that you can reward this author.' values={{ name }} />;
      tipButton = (
        <Button className='button button--block' active title='Invite' onClick={this.handleDirectClick}>
          <FormattedMessage id='tip_modal.send_message' defaultMessage='Message {name}' values={{ name }} />
        </Button>
      );
      break;
    }

    return (
      <div className='modal-root__modal interaction-modal'>
        <div className='tip-modal__lead'>
          <h3><span className='tip-modal__icon'>{icon}</span> {title}</h3>
          <p>{actionDescription}</p>
          <p><FormattedMessage id='tip_modal.preamble' defaultMessage='Since Reddcoin is decentralized peer-to-peer network, you can use your existing Reddcoin wallet to send reddcoin or create a wallet and fund your aaccount to get started.' /></p>
        </div>

        <div className='tip-modal__choices'>
          <div className='tip-modal__choices__choice'>
            <h3><FormattedMessage id='tip_modal.with_wallet' defaultMessage='With Wallet' /></h3>
            {tipButton}
          </div>

          <div className='tip-modal__choices__choice'>
            <h3><FormattedMessage id='tip_modal.without_wallet' defaultMessage='Without Wallet' /></h3>
            <p><FormattedMessage id='tip_modal.without_wallet_instructions' defaultMessage='Visit reddcoin.com and download a wallet to get started.' /></p>
          </div>
        </div>
      </div>
    );
  }

}
