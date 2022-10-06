import React from 'react'
import Modal, {
  BrandColors,
  ButtonAlignment,
  ActionType,
  ModalProps
} from 'Components/Modals/Modal'

const PreviewModal: React.FC<ModalProps> = (props) => {
  return (
    <Modal
      {...props}
      gaModalName={PreviewModal.name}
      header="Your landing page is not published yet"
      contentStyle={{ maxWidth: 600 }}
      footerButtons={[
        {
          actionType: ActionType.secondary,
          color: BrandColors.gray,
          alignment: ButtonAlignment.right,
          gaButtonName: `${PreviewModal.name} Close Button`,
          onClick: (e) => props.onRequestClose && props.onRequestClose(e),
          content: 'Close'
        }
      ]}
    >
      This is a preview of how your agency shop’s landing page will appear to
      clients. This won’t be published until you click Next on Personalize Your
      Page.
    </Modal>
  )
}

export default PreviewModal
