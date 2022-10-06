import React, { useEffect } from 'react'

interface Props {
  className?: string
  scrollToSection?: number
}

/* eslint-disable */
/**
 * Regex:
 *    Find specific <p> to <h2> - start with number
 *        /<p>(?=[1-9].)/g
 *        /</p>(?<=<h2>(.*))/g
 *    Find specific <p> to <b> - block with all Capitalized character
 */
const TEXTOFTC = (
  <>
    <h1>MyHealthily Terms of Service</h1>
    <p>Effective Date: December 1, 2021</p>
    <p>
      BY ACCESSING, USING THE SOFTWARE AND/OR SIGNIFYING YOUR ACCEPTANCE TO
      THESE TERMS OF SERVICE, YOU AGREE TO THE TERMS OF THIS AGREEMENT AS AND/OR
      ON BEHALF OF THE PERSON/ENTITY LISTED IN THE ACCOUNT CREATION, SIGN UP OR
      SIMILAR FORM (&ldquo;REGISTRATION FORM&rdquo;), THE ACCOUNT OWNER AND
      AUTHORIZED USERS.<span>&nbsp; </span>YOU REPRESENT AND WARRANT THAT YOU
      HAVE FULL AUTHORITY TO BIND THE ACCOUNT OWNER AND AUTHORIZED USERS TO
      THESE TERMS OF SERVICE. IF YOU DO NOT AGREE TO THESE TERMS OF SERVICE AND
      DO NOT HAVE THE AUTHORITY AS PROVIDED HEREIN, YOU MAY NOT AND SHALL NOT
      ACCESS, OR USE THE SERVICE (AS DEFINED IN THESE TERMS OF SERVICE).
    </p>
    <p>
      These Terms of Service ("Agreement" or &ldquo;Terms of Service&rdquo;) are
      a binding contract between the Account Owner(s) (as defined below)
      (referred to herein as &ldquo;Account Owner&rdquo;, &ldquo;You&rdquo;
      &ldquo;you&rdquo;, &ldquo;your&rdquo; or &ldquo;Your&rdquo;) and
      MyHealthily Insurance Solutions, LLC (referred to herein as
      &ldquo;MyHealthily&rdquo; or &ldquo;Us&rdquo; or &ldquo;We&rdquo;). The
      Terms of Service shall govern Your and the Team Employees&rsquo; use of
      the Service, and Your and the Team Employees&rsquo; rights and obligations
      with respect to User Data that placed in the Service, and associated
      Intellectual Property Rights thereto, as well as your creation of an
      account through which You and the Team Employees will access the Service
      (hereinafter an &ldquo;Account&rdquo;) for use in connection with the
      Service. By accessing, using, subscribing, purchasing, or downloading the
      Service, or any goods, materials, or content from the Website, You agree
      to, and ensure that all who access the Service through Your account,
      follow and be bound by the following terms and conditions and any other
      terms and conditions embodied in any other agreements you enter into with
      Us. If you do not agree with the Terms of Service, neither You nor the
      Team Employees may use the Website or the Service. The following Terms of
      Service applies to all Users including Brokers/Agents/Producers,
      Clients/Employers and Employees except where specifically noted otherwise.
    </p>
    <p>
      For Brokers/ Agents/Producers: My Healthily agrees that you are the owner
      of any insurance product account with an Client/Employer or Employee.
    </p>
    <p>
      For Brokers/ Agents/Producers: You hereby represent and warrant that you
      and your Team Employees as required by law, are licensed insurance agents,
      brokers or producers for the solicitation of Client/Employers and/or
      Employees for health care insurance products (e.g., a health insurance or
      HMO policy) and other ancillary insurance policies (e.g., a life or
      disability insurance policy).
    </p>
    <p>
      For Brokers/ Agents/Producers: You and applicable Team Employees must
      possess and maintain every license required by law to perform services
      under this Agreement, including in every state in which you conduct
      business under this Agreement. You and applicable Team Employees must
      provide proof of licensure to My Healthily upon My Healthily&rsquo;s
      request. You must immediately notify My Healthily of any expiration,
      termination, revocation, suspension or any other action by a Department of
      Insurance or any other governmental agency affecting licenses required to
      perform services under this Agreement.
    </p>
    <p>
      If You know, or have a suspicion or the good faith belief that, a Team
      Employee has violated the Terms of Service, You
      are&nbsp;is&nbsp;responsible for immediately revoking access rights to the
      User(s). Additionally, if you become aware that a&nbsp;Team Employee no
      longer possesses the requisite licenses or other credentials or is&nbsp;no
      longer employed by or affiliated with the You, You have the responsibility
      to immediately revoke access rights to these Users.&nbsp;
    </p>
    <p>
      NOTICE OF ARBITRATION AGREEMENT AND CLASS ACTION WAIVER: THIS AGREEMENT
      INCLUDES A BINDING ARBITRATION CLAUSE AND A CLASS ACTION WAIVER, SET FORTH
      BELOW, WHICH AFFECT YOUR RIGHTS ABOUT RESOLVING ANY DISPUTE WITH US.
      PLEASE READ IT CAREFULLY.
    </p>
    <p>
      These Terms of Service apply to Your and the Team Employees use of the
      Service and ALL transactions made on or through the Website in your use of
      the Service. The Account Owner manifests agreement to these Terms of
      Service by any act demonstrating your assent thereto, including clicking
      any button containing the words &ldquo;I agree&rdquo;, &ldquo;Create my
      account&rdquo; or similar syntax, by accessing the Website, by
      establishing an Account, or using the Service, whether you have read these
      Terms of Service or not. By clicking any such button or otherwise
      indicating Your assent, You agree to these Terms of Service. You should
      print a copy of these Terms of Service for your business and personal
      records.
    </p>
    <p>
      These Terms of Service may be modified by MyHealthily effective
      immediately by notifying you as provided in Section 29 below. By
      continuing to access or use the Service after the effective date of any
      such change, you agree to be bound by the modified Terms of Service.
    </p>
    <h2>1. Definitions</h2>
    <ul>
      <li>
        <span>
          &ldquo;Account Owner&rdquo; means the individual who establishes the
          Account, licensed agents, brokers or producers and their authorized
          users, the owner of the Account, and any other entity and/or person in
          whose name the Account is established, all of whom are agreed to be
          jointly and severally obligated under these Terms of Service. The
          Account Owner is responsible for the obligations and activities under
          the Account as well as the obligations and activities of all Users and
          Team Employees within the Account (including without limitation
          payment for the Account and deletion of the Account). The use of the
          phrase &ldquo;Account Owner&rdquo; in the singular shall also mean use
          in the plural.
        </span>
      </li>
      <li>
        <span>
          &ldquo;Brokers&rdquo; or &ldquo;Agents&rdquo; or
          &ldquo;Producers&rdquo; means licensed insurance agents, brokers or
          producers for the solicitation of Clients/Employers and/or Employees
          for health care insurance products (e.g., a health insurance or HMO
          policy) and other ancillary insurance policies (e.g., a life or
          disability insurance policy).
        </span>
      </li>
      <li>
        <span>
          &ldquo;Client(s)/Employer(s)&rdquo; means the organization or entity
          which is a Broker, Agent or Producer&rsquo;s customer or prospective
          customer.
        </span>
      </li>
      <li>
        <span>
          &ldquo;Dispute&rdquo; will have the broadest meaning possible and
          means any dispute, action, or other controversy between you and
          MyHealthily relating to the Service, any transaction or relationship
          between you and MyHealthily resulting from your use of the Service,
          communications between you and MyHealthily, or this Agreement &ndash;
          whether in contract, warranty, tort, laws, or regulations.
        </span>
      </li>
      <li>
        <span>
          &ldquo;Employee&rdquo; means a Client/Employer&rsquo;s employee, or
          other person who is a beneficiary of an insurance policy.
        </span>
      </li>
      <li>
        <span>
          "HIPAA" means the Health Insurance Portability and Accountability Act
          of 1996, the Health Information Technology for Economic and Clinical
          Health Act and their implementing regulations as amended from time to
          time;
        </span>
      </li>
      <li>
        <span>
          "Intellectual Property Rights" means copyrights, trademarks, service
          marks, trade dress, publicity rights, database rights, patent rights,
          and other intellectual property rights or proprietary rights
          recognized by law;
        </span>
      </li>
      <li>
        <span>
          "Protected Health Information" or "PHI" means protected health
          information as defined by HIPAA's Privacy Rule found at 45 C.F.R.
          &sect;160.103.
        </span>
      </li>
      <li>
        <span>"Servers" are computers or devices that host the Service.</span>
      </li>
      <li>
        <span>
          &ldquo;Service&rdquo; means MyHealthily&rsquo;s technology and
          software platforms available on the Websites and any affiliated
          sub-domains and mobile applications and sites (on launch), Software,
          and Servers, designed to enable customers to manage communications
          with users a containing a dashboard for accessing and managing
          customer data regarding those users, which are part of the
          &ldquo;Service&rdquo; whether or not stated separately within these
          Terms of Service, when made available by MyHealthily.
        </span>
      </li>
      <li>
        <span>
          "MyHealthily Software" or &ldquo;Software&rdquo; is the software
          provided to you by MyHealthily and/or its suppliers under license or
          with respect to which you have access, in connection with the Service.
        </span>
      </li>
      <li>
        <span>
          &ldquo;Team Member&rdquo; means Account Owner&rsquo;s staff,
          contractors, administrators, or other service providers who are
          granted access to the Account with the authorization of the Account
          Owner.
        </span>
      </li>
      <li>
        <span>
          &ldquo;Transaction Data&rdquo; means customer information, User Data,
          account information or other data or information of any kind that is
          provided by or generated or collected on your behalf, or the
          Clients/Employers or their Employees, by the Service.{' '}
        </span>
      </li>
      <li>
        <span>
          "User Data" means any data or images that you or the Clients/Employers
          or their<span>&nbsp; </span>Employees,<span>&nbsp; </span>upload,
          stream or submit to the Servers, Website, or other areas of the
          Service, or generated or collected on your behalf from the Servers,
          Website, the Service or third parties, including but not limited to
          Protected Health Information as that term is defined below, video,
          image and sound data and Transaction Data;
        </span>
      </li>
      <li>
        <span>
          &ldquo;User(s)&rdquo; means the Account Owner(s), and/or Team Member.
        </span>
      </li>
      <li>
        <span>
          "Website" means the websites and services available from the domain
          and sub-domains of https://myhealthily.com/, and<span>&nbsp; </span>
          any related or successor domains and mobile applications and sites
          from which MyHealthily may offer the Service.
        </span>
      </li>
    </ul>
    <h2>2. Verification for MyHealthily</h2>
    <p>
      By accepting these Terms of Service in connection with an Account, the
      person acknowledging agreement or assenting to these Terms of Service
      represents that they are at least 18 years of age, or the legal age of
      majority where in the place of residence if that jurisdiction has an older
      age of majority, and has the legal authority to contractually agree to
      these Terms of Service on behalf of the Account Owner. You further agree
      that as a condition to accessing the Service, you will submit to Account
      and Account Owner verification as required by MyHealthily, and provide
      only true and accurate identification documentation to MyHealthily or its
      third party service providers as requested by MyHealthily. You are
      responsible for the security of any account verification information, such
      as user names and passwords, including without limitation your
      Users&rsquo; user names and password. You agree that any Users who are
      under 13 years old require their parent or legal guardian&rsquo;s consent
      to collect their User Data or for their use of the Service, which consent
      you and the Account Owner are responsible for obtaining, prior to the use
      by such User of the Service.
    </p>
    <h2>3. Establishing an Account</h2>
    <p>
      You must establish an Account with MyHealthily to use the Service. You
      agree to provide accurate, current, and complete information about You and
      the individual who establishes the Account ("Registration Data") as
      prompted by the Registration Form and as required to be added in the
      &ldquo;Settings&rdquo; or other page on the Website, and to use the
      Account management tools provided to keep your Registration Data accurate,
      current and complete. MyHealthily will designate You as the Account Owner
      and assign an account name (your &ldquo;Account Name&rdquo;). You and your
      Team Members must each choose a user name to identify yourselves under the
      Account Name.
    </p>
    <h2>4. Responsibility for Use of Account</h2>
    <p>
      You, as the Account Owner, are responsible for all activities conducted
      through your Account, including activities of the Team Members and Users,
      and you are responsible for all activities conducted through your user
      name and are responsible for Users to whom you grant access to your
      Account, including Clients/Employers and Employees and those you authorize
      to access your Account on behalf of yourself, or clients. In the event
      that fraud, violation of law, regulation or rule, or conduct that violates
      these Terms of Service occurs (whether by you or someone else) that is in
      any way connected with your Account, we may suspend or terminate your use
      of the Service and your Account as described in Section 21 and you shall
      be financially responsible to MyHealthily for the consequences of such
      use.
    </p>
    <h2>5. Selection and Use of Account Password</h2>
    <p>
      At the time Your Account is created, You must select a password. You are
      responsible for maintaining the confidentiality of Your password and are
      responsible for any damages, claims, losses or other harm resulting from
      Your disclosure of Your password, authorization of the disclosure of Your
      password, or any person's use of Your password or Your Account and those
      who gain access to your Account or Account Name. At no time should you
      respond to an online request for a password other than in connection with
      the log-on process to the Service. Your disclosure of Your password to any
      other person is at your own risk.
    </p>
    <p>
      You and each of those using your Account must have separate user names and
      passwords. Team Members and Users may not share entry identifications and
      authentication passwords and any sharing may result in a suspension or
      termination of access for the User and the Account Owner, and/or an
      increase in charges, at MyHealthily&rsquo;s sole discretion.
    </p>
    <h2>6. Fees and Billing</h2>
    <p>
      For Brokers/ Agents/Producers: MyHealthily provides the Service for the
      fees and other charges set forth on the Website at{' '}
      <a href="https://app.myhealthily.com/shop/agency/pricing">
        <span>https://app.myhealthily.com/shop/agency/pricing</span>
      </a>{' '}
      <span>or</span> other location on the Website. All prices listed exclude
      all sales taxes, fees, use taxes, charges, duties, levies and similar
      governmental charges (&ldquo;Sales Taxes&rdquo;) imposed on the provision
      of the Service and all such Sales Taxes shall be borne solely by and paid
      by the Account Owner to MyHealthily and deemed to be in addition to the
      fees charged in connection with the Service. Where applicable, Account
      Owner shall be responsible for all Sales Taxes and MyHealthily reserves
      the right to collect Sales Taxes retroactively. We may, at any time, add
      new services for additional fees and charges, or prospectively modify fees
      and charges for existing services (including prospectively charging fees
      for the Service not previously charged for) on notice as provided herein.
      You acknowledge that it is Your responsibility to ensure payment in
      advance for all paid aspects of the Service, and to ensure that your
      credit or debit cards or other payment instruments accepted by MyHealthily
      and/or its payment processor, continue to be valid and sufficient for such
      purposes. We may suspend or terminate Your use and Your Account&rsquo;s
      use, as provided in Section 21, in the event of any payment delinquency.
      Other services are available from MyHealthily and the agreement with
      respect to those services and fees due to MyHealthily incorporate by
      reference these Terms of Service as well as any specific terms and
      conditions presented to you. You will not be entitled to any refund, at
      any time including without limitation on termination or expiration of the
      Agreement. All payments once made to MyHealthily shall have been earned by
      MyHealthily as of the date of payment. You will not be entitled to any
      refund for the partial use of the Service or credits at any time.
    </p>
    <p>
      ALL COMMISSIONS TO BE PAID TO BROKERS/AGENTS/PRODUCERS ARE PAID BY THE
      INSURANCE CARRIERS OR AUTHORIZED THIRD PARTY ADMINISTRATORS. WITHOUT A
      SEPARATE WRITTEN AGREEMENT SIGNED BY AN OFFICER OF MY HEALTHILY,
      <span>&nbsp; </span>MY HEALTHILY IS NOT RESPONSIBLE FOR THE PAYMENT OF ANY
      COMMISSONS TO BROKERS/AGENTS/PRODUCERS.
    </p>
    <h2>7. Modification of Service</h2>
    <p>
      MyHealthily reserves the right to add, modify, discontinue or eliminate
      aspect(s), features or functionality of the Service from time to time for
      any reason including without limitation for purposes of compliance with
      applicable laws and regulations and direction of regulatory agencies, to
      effect improvements in security and functionality, to correct errors, or
      for any other purposes, at its sole discretion.
    </p>
    <h2>
      8. Privacy Policy, Protected Health Information, User Data and Use of Your
      Information, Email, Data Deletion on Termination
    </h2>
    <p>
      Our{' '}
      <a href="https://myhealthily.com/privacy-policy-2">
        <span>Privacy Policy</span>
      </a>{' '}
      describes how we use and share Personal Information (as such term is
      defined in the Privacy Policy), including
      <span>&nbsp; </span>any Registration Data You provide, or other Personal
      Information we receive when You submit an inquiry or request further
      information, or receive updates and promotions about or related to the
      Service.<span>&nbsp; </span>Our Privacy Policy does not apply to any
      Personal Information contained within User Data that we collect and
      process only on your behalf when we provide the Service.
    </p>
    <p>
      In providing you our Service, MyHealthily will not sell any PHI contained
      in User Data. MyHealthily will not retain, use or disclose the PHI You
      provide to us about Your Client/Employers or Employees. MyHealthily will
      not use or disclose Personal Information about Client/Employers or
      Employees except for the purpose of performing our obligations under these
      Terms of Service, providing and improving the Services and as permitted
      under the Privacy Policy. ,Employee.&nbsp;
    </p>
    <p>
      We will make no use of PHI that is not permitted by these Terms of
      Service, the BAA (as defined below) or that is prohibited by applicable
      law, including but not limited to HIPAA.
    </p>
    <p>
      It is Your responsibility to comply with all applicable privacy and data
      protection laws and to ensure that You have provided all required notices
      and obtained all necessary consents (including with respect to third
      parties access) from Your Users, and Clients/Employers and Employees, and
      that the User (including without limitation Your and Clients/Employers and
      Employees) have agreed to the collection of their User Data (including
      PHI) and the access of their User Data by You, by us, and, where
      applicable, other third parties. Any sample documentation that is provided
      by MyHealthily for obtaining consent or other information from Users is
      for illustration only, and You alone (and not MyHealthily) are responsible
      to ensure that such documentation is adequate and enforceable. MyHealthily
      does not provide legal or compliance advice and You are responsible for
      retaining competent counsel and advisors for these purposes.
    </p>
    <p>
      In the event that we receive a subpoena, court order, or other legal
      request compelling the disclosure of any of Clients/Employers&rsquo; or
      Employees&rsquo; User Data (including PHI) or any of Your data or
      information or any User Data, we will notify You of the existence of such
      subpoena, court order or other legal request prior to disclosing the PHI
      or other data or<span>&nbsp; </span>information or any User Data. unless
      ordered to not do so by a court of competent jurisdiction, requested not
      to do so by law enforcement, or unless our legal counsel advises us that
      prior notification is not required or in violation of applicable law
    </p>
    <p>
      In the event of termination of this Agreement, whether by your
      cancellation of the Agreement, your breach of, or as otherwise provided in
      these Terms of Service, there is an download feature in the Service which
      will enable you to retrieve your User Data contained within the Service
      prior to the account termination date. It is your sole responsibility to
      download from your Account a file or files containing the User Data
      contained within the Service before the account termination date{' '}
      <span>
        and to ensure the secure preservation of User Data (including PHI) for
        Clients/Employers or Employees pursuant to federal and state law
      </span>
      . MyHealthily will delete the User Data for your Account as provided in
      Section 22 of these Terms of Service.
    </p>
    <h2>9. No Responsibility for Acts of Omissions of Third Party Websites</h2>
    <p>
      The Service may contain links to, or otherwise allow connections to
      third-party websites, servers, and online services or environments that
      are not owned or controlled by MyHealthily. You agree that MyHealthily is
      not responsible or liable for the content, policies, or practices of any
      third-party websites, servers, or online services or environments. Please
      consult any applicable terms of use and privacy policies provided by the
      third party for such websites, servers, or online services or
      environments.
    </p>
    <h2>10. Your Rights and Obligations with Respect to User Data</h2>
    <p>
      In connection with User Data you upload or submit to or which is created
      by the Service, you affirm, represent, and warrant that you own or have
      all necessary Intellectual Property Rights, licenses, consents, and
      permissions to use and authorize MyHealthily to use, retain, copy, and
      process the User Data in the Service and as contemplated by this Agreement
      and that You guarantee and are solely responsible for the accuracy,
      integrity and/or completeness of the User Data. You agree that by
      uploading or submitting any Content or User Data to or through the
      Service, and permitting Your Users (including without limitation clients)
      to upload any Transaction Data into the Service, You hereby automatically
      at such time grant MyHealthily (and its affiliates) a non-exclusive,
      worldwide, royalty-free, sublicensable, and transferable license to use,
      reproduce, distribute, prepare derivative works of, perform and display
      <span>&nbsp; </span>User Data and Transaction Data (including User Data
      and Transaction Data that is created, collected or generated by the
      Service or MyHealthily using the User Data and Transaction Data you
      submit) solely for the purposes of providing the Service. You agree that
      the license includes the right to copy, analyze and use any of Your User
      Data and Transaction Data as MyHealthily may deem necessary or desirable
      for purposes of debugging, testing, or providing support or development
      services in connection with the Service and future improvements to the
      Service. The license granted in this Section is referred to as the
      "Service Data License." You also acknowledge that the Service Data License
      granted to MyHealthily with respect to Your content will survive the
      termination of your Account to permit MyHealthily: (i) to retain server
      copies of particular instances of Your User Data, including copies stored
      in connection with back-up, debugging, and testing procedures; and (ii) to
      enable the exercise of the licenses granted in this Section for any other
      copies or instances of the same User Data that You have not specifically
      deleted from the Service. Notwithstanding anything to the contrary herein,
      You hereby provide MyHealthily (and its affiliates) an irrevocable
      perpetual royalty free, assignable license, authority, and permission to
      obtain, copy, and use, at MyHealthily&rsquo;s request, without notice to
      You, from Clients/Employers and/or Employees, all of Your Transaction Data
      and User Data for purposes of providing You the Service.
    </p>
    <p>
      You acknowledge that You are responsible for all information and User Data
      you and those who are under the Account (including without limitation
      Clients/Employers and/or Employees and Team Members) input into the
      Service. You hereby acknowledge that authorized users of unlocking any
      previously locked progress notes may be a violation by You and Your Team
      Members of applicable professional standards and /or applicable law. You
      understand and agree that You are bound by various laws and regulations,
      including but not limited to&nbsp;HIPAA, which require that You preserve
      the availability, accuracy, integrity, and confidentiality of PHI and
      personally identifiable information. You also acknowledge and agree that
      all of your activity within the Service is automatically logged (including
      into audit logs), including the unlocking and changes to the progress
      notes, and that such activity may be audited by Account Owners, account
      administrators, regulators, or others.&nbsp;
    </p>
    <h2>11. Customer Support</h2>
    <p>Customer support is available by notifying support@myhealthily.com</p>
    <h2>12. Interruption of Service</h2>
    <p>
      MyHealthily may on occasion need to interrupt or suspend the Service, with
      or without prior notice, to protect the integrity or functionality of the
      Service or for maintenance purposes. You agree that MyHealthily is not
      liable for any interruption or suspension of the Service (whether
      intentional or not), and You understand that neither You nor any Team
      Members of Users will be entitled to any refunds of fees or other
      compensation for interruption or suspension of service. Likewise, You
      agree that in the event of loss of any User Data, we will not be liable
      for any purported damage or harm arising therefrom.
    </p>
    <h2>
      13. MyHealthily's Intellectual Property Rights and Limited License Granted
      to You
    </h2>
    <p>
      <strong>Intellectual Property Rights. </strong>MyHealthily owns
      Intellectual Property Rights in and to the Service, except User Data,
      including the MyHealthily Software, the Websites, and the Servers, and in
      and to our trademarks, service marks, trade names, logos, domain names,
      taglines, and trade dress (collectively, the "MyHealthily Marks"). You
      understand that such Intellectual Property Rights are apart from any
      rights You may have in User Data you upload or submit to the Service, as
      discussed above. You acknowledge and agree that MyHealthily and its
      licensors own all right, title, and interest in and to the Service,
      including all Intellectual Property Rights therein, other than with
      respect to User Data. Except as expressly granted in this Agreement, all
      rights, title, and interest in and to the Service, except all User Data,
      and in and to the MyHealthily Marks are reserved by MyHealthily.
      Copyright, trademark and other laws of the United States and foreign
      countries protect the Service and the MyHealthily Marks.
    </p>
    <p>
      <strong>Limited License</strong>. MyHealthily hereby grants You a
      non-exclusive, non-transferable, non-sublicensable, limited, revocable
      license to access and use the Service specifically as set forth in these
      Terms of Service and expressly conditioned upon You and Your Account
      remaining active, in good standing, and in full compliance with these
      Terms of Service. You agree that you will not (i) allow any person or
      entity not authorized by MyHealthily to use or access the Software, (ii)
      attempt to copy any ideas, features, functions or graphics contained in
      the Service; (iii) use the MyHealthily Software in the operation of a
      service bureau, an application service provider or for any other purpose
      intended to benefit a party other than You, (iv) alter or modify the
      MyHealthily Software, (v) sell, assign, sublicense, rent, lease or
      otherwise transfer the MyHealthily Software or any rights in connection
      therewith, or (vi) attempt to translate, disassemble, decompile, reverse
      assemble, reverse engineer all or any part of the Service or otherwise
      attempt to derive the source code for the Software.
    </p>
    <p>
      <strong>Feedback and other Input</strong>. You may provide suggestions,
      ideas and/or feedback (collectively, &ldquo;Feedback&rdquo;) to
      MyHealthily or in the use of the Service or Website regarding MyHealthily
      Website, products or Service. You agree that MyHealthily will be free to
      use, irrevocably, in perpetuity and for any purpose, all Feedback provided
      to it by You or our Team Members and that all right title and interest in
      Feedback is assigned to MyHealthily.<span>&nbsp; </span>The foregoing
      grant of rights is made without any duty to account to You or to any of
      the foregoing persons or entities for the use of such Feedback.
    </p>
    <p>
      <strong>Mobile Application License. </strong>Subject to Your compliance
      with these Terms of Service, and to the extent available for commercial
      release to you, MyHealthily grants You a limited non-exclusive,
      non-transferable license to use any of the MyHealthily mobile applications
      and to access the Website via a single mobile device or computer that You
      own or control and to run such copies of the MyHealthily mobile
      applications on such device solely for Your own personal use.
    </p>
    <p>
      You shall not: (i) license, sublicense, sell, resell, transfer, assign,
      distribute or otherwise commercially exploit or make available to any
      third party the MyHealthily mobile application in any way; (ii) modify or
      make derivative works based upon the Website or MyHealthily mobile
      application; (iii) create Internet &ldquo;links&rdquo; to the Website or
      &ldquo;frame&rdquo; or &ldquo;mirror&rdquo; the MyHealthily mobile
      application on any other server or wireless or Internet-based device; (iv)
      reverse engineer or access the MyHealthily mobile application in order to
      (a) design or build a competitive product or service, (b) design or build
      a product using similar ideas, features, functions or graphics of the
      Website or MyHealthily mobile application, or (c) copy any ideas,
      features, functions or graphics of the Website or MyHealthily mobile
      application; or (v) launch an automated program or script, including, but
      not limited to, web spiders, web crawlers, web robots, web ants, web
      indexers, bots, viruses or worms, or any program which may make multiple
      server requests per second, or unduly burdens or hinders the operation
      and/or performance of the Website or MyHealthily mobile application.
    </p>
    <h2>14. Prohibited Conduct While Using the Service</h2>
    <p>
      For Brokers/Agents/Producers: Any rates and quotes you obtain for any
      Client/Employer or Employee through the Service, or Website must be for
      the use and benefit of MyHealthily, which you agree is the managing
      general agent with respect to accounts for which you obtained the rates
      and quotes. You agree that you will not go direct to any insurance
      carriers with respect to any rates or quotes obtained through use of the
      Service or the Website and will only use the rates and quotes to submit
      application and enrollment forms through the Service and the Website. You
      agree that you will not copy or reproduce the rates and quotes except to
      submit application and enrollment forms through the Service and the
      Website<span>.</span>
    </p>
    <p>
      For Brokers/Agents/Producers/Clients/Employers/Employees: You agree that
      You will not, and will cause Team Members and Users to not:
    </p>
    <ul>
      <li>
        <span>
          Post, display or transmit information or data, User Data, or
          Transaction Data, that violates any law, regulation or rule, or the
          rights of any third party including without limitation Intellectual
          Property Rights;
        </span>
      </li>
      <li>
        <span>
          Impersonate any person or entity without their consent, or otherwise
          misrepresent your affiliation;
        </span>
      </li>
      <li>
        <span>
          Post or transmit viruses, Trojan horses, worms, spyware, time bombs,
          cancelbots, or other computer programming routines that may harm the
          Service or interests or rights of other users, or that may harvest or
          collect any data or personally identifiable<span>&nbsp; </span>
          information about other users without their consent;
        </span>
      </li>
      <li>
        <span>
          Engage in malicious, disruptive or other conduct that impedes or
          interferes with other Users' normal use of the Service; or
        </span>
      </li>
      <li>
        <span>
          Attempt to gain unauthorized access to any other User&rsquo;s Account,
          password or User Data, or allow more than one person to use an
          Account.
        </span>
      </li>
      <li>
        <span>
          You agree that You and your Team Members and Users will not upload,
          publish, or submit to any part of the Service any User Data that is
          protected by Intellectual Property Rights or otherwise subject to
          proprietary rights, including trade secret or privacy rights, unless
          You, the appropriate Team Member or Users are the owner of such rights
          or have permission from the rightful owner to upload or submit the
          User Data and to grant MyHealthily all of the license rights granted
          in this Agreement. You agree that MyHealthily will have no liability
          for, and You agree to defend (at MyHealthily&rsquo;s option),
          indemnify, and hold MyHealthily harmless for, any claims, losses or
          damages arising out of or in connection with Your use of any User
          Data.
        </span>
      </li>
    </ul>
    <h2>15. Violation of Terms of Service</h2>
    <p>
      Any violation by You, Your Team Members or Users of these Terms of Service
      may result in immediate suspension or termination of your Account without
      any refund or other compensation at MyHealthily&rsquo;s option.
    </p>
    <h2>16. Releases</h2>
    <p>
      You agree not to hold MyHealthily liable for the Content, User Data,
      actions, or inactions of You or other Users of the Service or of other
      third parties. As a condition of access to the Service, you release
      MyHealthily (and its officers, directors, shareholders, agents,
      subsidiaries, and employees) from claims, demands, losses, liabilities and
      damages (actual and consequential) of every kind and nature, known and
      unknown, arising out of or in any way connected with any dispute You have
      or claim to have with one or more other users of the Service or with other
      third parties, including whether or not MyHealthily becomes involved in
      any resolution or attempted resolution of the dispute. If You are a
      California resident, You waive California Civil Code Section 1542 (as may
      be amended). The statute currently provides: "A general release does not
      extend to claims that the creditor or the releasing party does not know or
      suspect to exist in his or her favor at the time of executing the release
      and that, if known by him or her, would have materially affected his or
      her settlement with the debtor or release party." If You are a resident of
      another jurisdiction, You waive any comparable statute or doctrine.
    </p>
    <h2>17. Disclaimer of Express and Implied Warranties</h2>
    <p>
      MyHealthily does not guarantee premium and related insurance rates that
      are provided through use of the Service or Website. All premium and
      related insurance rates are subject to approval and issuance of a policy
      by the applicable insurance carrier and rates may vary from that displayed
      for many reasons including without limitation demographic and criteria
      changes and other reasons outside the control of MyHealthily.
    </p>
    <p>
      MYHEALTHILY PROVIDES THE SERVICE, INCLUDING WITHOUT LIMITATION THE
      SOFTWARE, THE WEBSITES, THE SERVERS, AND YOUR ACCOUNT, STRICTLY ON AN "AS
      IS" BASIS, AND HEREBY EXPRESSLY DISCLAIMS ALL WARRANTIES OR CONDITIONS OF
      ANY KIND, WRITTEN OR ORAL, EXPRESS, IMPLIED OR STATUTORY, INCLUDING
      WITHOUT LIMITATION ANY IMPLIED WARRANTY OF TITLE, NONINFRINGEMENT,
      MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. NO VALUE, EITHER
      EXPRESS OR IMPLIED, IS GUARANTEED OR WARRANTED WITH RESPECT TO ANY
      CONTENT. NOTWITHSTANDING ANY INTELLECTUAL PROPERTY RIGHTS YOU MAY HAVE IN
      YOUR USER DATA OR ANY EXPENDITURE ON YOUR PART, MYHEALTHILY AND YOU
      EXPRESSLY DISCLAIM ANY COMPENSABLE VALUE RELATING TO OR ATTRIBUTABLE TO
      ANY DATA RELATING TO YOUR ACCOUNT RESIDING ON MYHEALTHILY' SERVERS. YOU
      ASSUME ALL RISK OF LOSS FROM USING THE SERVICE ON THIS BASIS. MyHealthily
      does not ensure continuous, error-free, secure or virus-free operation of
      the Service, the Software, the Websites, the Servers,<span>&nbsp; </span>
      or your Account, and You understand that You shall not be entitled to
      refunds or other compensation based on MyHealthily's failure to provide
      any of the foregoing other than as explicitly provided in this Agreement.
      Some jurisdictions do not allow the disclaimer of implied warranties, and
      to that extent, the foregoing disclaimer may not apply to You.
    </p>
    <p>
      MyHealthily does not guarantee that by mere use of the Software you will
      be in compliance with HIPAA or other applicable law or regulation, and you
      understand and agree that you are responsible for maintaining
      administrative, technical and physical safeguards necessary to ensure the
      confidentiality, availability, and integrity with respect to PHI and to
      otherwise comply with HIPAA and other applicable law or regulation.
    </p>
    <h2>18. Limitation of Liability</h2>
    <p>
      IN NO EVENT SHALL MYHEALTHILY OR ANY OF ITS DIRECTORS, OFFICERS,
      EMPLOYEES, EQUITY OWNERS, MANAGERS, SUBSIDIARIES, AGENTS OR LICENSORS BE
      LIABLE TO YOU OR TO ANY THIRD PARTY FOR ANY SPECIAL, INCIDENTAL, INDIRECT,
      CONSEQUENTIAL, RELIANCE, PUNITIVE OR EXEMPLARY DAMAGES OR DISGORGEMENT OR
      COMPARABLE EQUITABLE REMEDY, INCLUDING WITHOUT LIMITATION ANY DAMAGES FOR
      LOST DATA OR LOST PROFITS, ARISING (WHETHER IN CONTRACT, TORT, STRICT
      LIABILITY OR OTHERWISE) OUT OF OR IN CONNECTION WITH THE SERVICE
      (INCLUDING ITS MODIFICATION OR TERMINATION), THE MYHEALTHILY SOFTWARE, THE
      WEBSITES, THE SERVERS, YOUR ACCOUNT (INCLUDING ITS TERMINATION OR
      SUSPENSION) OR THIS AGREEMENT, WHETHER OR NOT MYHEALTHILY MAY HAVE BEEN
      ADVISED THAT ANY SUCH DAMAGES MIGHT OR COULD OCCUR AND NOTWITHSTANDING THE
      FAILURE OF ESSENTIAL PURPOSE OF ANY REMEDY. IN NO EVENT WILL MYHEALTHILY'S
      CUMULATIVE LIABILITY TO YOU EXCEED THE GREATER OF ONE HUNDRED FIFTY
      DOLLARS (U.S. $150.00). Some jurisdictions do not allow the foregoing
      limitations of liability, so to the extent that any such limitation is
      found to be impermissible, such limitation may not apply to You.
    </p>
    <h2>19. Indemnification</h2>
    <p>
      <span>
        MyHealthily will defend You from and against any claim by a third party
        alleging that the Service when used as authorized under this Agreement,
        processed accurate and timely input provided by You and failed to
        accurately transmit such input to an insurance carrier or third party
        administrator and will indemnify and hold harmless You from and against
        any damages and costs finally awarded against you resulting from such
        claim.{' '}
      </span>
      You agree to defend, indemnify and/or hold harmless MyHealthily, its
      officers, directors, shareholders, employees, subsidiaries, and agents
      from all damages, liabilities, claims and expenses, including without
      limitation attorneys' fees and costs, arising from: (i) any breach or
      alleged breach by You or your Team Members or Users of these Terms of
      Service, including without limitation your representations and warranties
      relating to your data, User Data; (ii) claims, losses and causes of action
      asserted by any Users, and by Brokers/Agents/Producers, claims, losses and
      causes of action asserted Clients/Employers or Employees, or (iii) your
      acts, omissions or use of the Service, including without limitation your
      negligent, willful or illegal conduct. In any matter in which you have
      agreed to indemnify MyHealthily, without the express written consent of
      MyHealthily, You may not settle any matter or admit liability if, upon
      doing so, you are admitting liability or fault on the part of MyHealthily.
      We reserve the right to assume the exclusive defense and control of any
      matter otherwise subject to indemnification by you, and in such case, you
      agree to cooperate with our defense of such claim.
    </p>
    <h2>
      20. Legal Relationship Between You and MyHealthily; No Third Party
      Beneficiaries
    </h2>
    <p>
      You acknowledge that Your participation in the Service, including your
      creation or uploading of Content in the Service, does not make You a
      MyHealthily employee and that You do not expect to be, and will not be,
      compensated by MyHealthily for such activities, and You will make no claim
      inconsistent with these acknowledgements. In addition, no agency,
      partnership, joint venture, franchise relationship is intended or created
      by this Agreement. There are no third party beneficiaries, intended or
      implied, under this Agreement.
    </p>
    <h2>21. Suspension and Termination of Accounts</h2>
    <p>
      You may terminate this Agreement by closing your Account at any time for
      any reason. Subject to MyHealthily's obligations pursuant to Section 8, in
      such event, MyHealthily shall have no further obligation or liability to
      You under this Agreement or otherwise. You may not suspend Your own
      Account. If you suspend Your Account, then the Account will be deemed
      terminated (see Sections 8 and 21 herein, regarding deletion of your User
      Data on termination). In addition, MyHealthily may suspend or terminate
      Your Account, without notice, for breach if You violate this Agreement, or
      any terms regarding payment of required fees and charges due under this
      Agreement. MyHealthily may, at its sole discretion, provide you a grace
      period prior to termination, in the event of a breach or Your failure to
      pay fees and charges, without waiving its rights hereunder to terminate
      immediately upon such events.<span>&nbsp; </span>We may suspend or
      terminate Your Account (or the access of any Team Member) if we determine
      in our discretion that such action is desirable for any reason, or
      advisable to comply with applicable legal requirements, or to protect the
      rights or interests of MyHealthily or any third party. Under no
      circumstances, will you will be entitled to compensation or a refund for
      any interruption, suspension or termination, and You acknowledge
      MyHealthily will have no liability to You or your Team Members or Users in
      connection with any interruption, suspension or termination.
    </p>
    <h2>22. Termination of Licenses Upon Termination of Account</h2>
    <p>
      Upon termination of Your Account, all licenses granted by MyHealthily to
      use the Website, Software, and the Service will automatically terminate,
      and User Data in Your Account will be retained by MyHealthily. While My
      Healthily has a general policy not to delete or destroy User Data for a
      period of seven (7) years, MyHealthily reserves the right to delete or
      destroy User Data, in part or in full, at its discretion without notice.
      You are responsible for exporting all account data and ensuring the secure
      preservation of PHI for the Clients/Employers or Employees pursuant to
      federal and state law, and ethical requirements. During the time frame
      beginning on termination or expiration of Your Account, your access to the
      Service will be limited to downloading your User Data.
    </p>
    <h2>23. Liability for Unpaid Fees Upon Termination of Account</h2>
    <p>
      Upon termination by You or by MyHealthily of your Account, You will not
      receive any refund of any amounts previously paid and You will remain
      liable for any charges incurred or unpaid amounts owed by You to
      MyHealthily.
    </p>
    <h2>24. Survival of Terms After Termination</h2>
    <p>
      The following terms will survive any termination of this Agreement:
      Sections 1, 2, 4, 6, 8, 11, 13, 17 and 20 through 38. You will not be
      entitled to any refund on termination or expiration of the Agreement.
    </p>
    <h2>25. Dispute Resolution</h2>
    <p>
      In the event of a Dispute between You and MyHealthily (including any
      dispute over the validity, enforceability, or scope of this dispute
      resolution provision), other than with respect to claims for injunctive
      relief, the Dispute will be resolved by binding arbitration pursuant to
      the rules of the American Arbitration Association Commercial Arbitration
      Rules. The place of the arbitration shall be in Bergen County, NJ. In the
      event that there is any Dispute between You and MyHealthily that is
      determined not to be subject to arbitration pursuant to the preceding
      sentence, You agree to submit in that event to the exclusive jurisdiction
      and venue of the state and federal courts located in the Bergen County,
      NJ]. You agree that this Agreement and the relationship between you and
      MyHealthily shall be governed by the Federal Arbitration Act and the laws
      of the State of California without regard to conflict of law principles or
      the United Nations Convention on the International Sale of Goods.
      Notwithstanding this, either party shall still be allowed to apply for
      injunctive or other equitable relief to protect or enforce that party's
      Intellectual Property Rights in any court of competent jurisdiction where
      the other party resides or has its principal place of business.
    </p>
    <p>
      <strong>Class Action Waiver</strong>
    </p>
    <p>
      Any proceedings to resolve or litigate any Dispute in any forum will be
      conducted solely on an individual basis. Class arbitrations, class
      actions, private attorney general actions, consolidation of your Dispute
      with other arbitrations, or any other proceeding in which either party
      acts or proposes to act in a representative capacity or as a private
      attorney general are not permitted and are waived by You, and an
      arbitrator will have no jurisdiction to hear such claims. If a court or
      arbitrator finds that the class action waiver in this section is
      unenforceable as to all or some parts of a Dispute, then the class action
      waiver will not apply to those parts. Instead, those parts will be severed
      and proceed in a court of law, with the remaining parts proceeding in
      arbitration. If any other provision of this Dispute resolution section is
      found to be illegal or unenforceable, that provision will be severed with
      the remainder of this section remaining in full force and effect.
    </p>
    <h2>26. Disclaimer of Warranties as to Use Outside of the United States</h2>
    <p>
      MyHealthily is a United States-based service. We make no warranty or
      representation that any aspect of the Service is appropriate for use
      outside of the United States or may be used for persons who are not then
      located outside the United States. Those who access the Service from other
      locations are responsible for compliance with applicable local laws or
      regulations. The Software is subject to applicable export laws and
      restrictions.
    </p>
    <h2>27. Assignment of Agreement and Account</h2>
    <p>
      You may not assign this Agreement or Your Account without our prior
      written consent. You may not transfer or sublicense any licenses granted
      by MyHealthily in this Agreement without our prior written consent. We may
      assign this Agreement, in whole or in part, and all related rights,
      licenses, benefits and obligations, without restriction, including the
      right to sublicense any rights and licenses under this Agreement without
      your consent<span>.</span>
    </p>
    <h2>
      28. Integration, Interpretation of Section Headings and Severability
    </h2>
    <p>
      The agreements, understandings and policies referenced in this Agreement
      sets forth the entire agreement and understanding between You and
      MyHealthily with respect to the subject matter hereof and supersedes any
      prior or contemporaneous agreements or understandings. MyHealthily
      reserves the right to modify this Agreement and Terms of Service at any
      time upon notification to you as provided in Section 29. If any future
      change is unacceptable to You, You should discontinue using the Service.
      Your continued use of the Service will always indicate your acceptance of
      this agreement and any changes to it.
    </p>
    <p>
      You acknowledge that no other written, oral or electronic communications
      will serve to modify or supplement this Agreement, and You agree not to
      make any claims inconsistent with this understanding or in reliance on
      communications not part of this Agreement. The section headings used
      herein, including descriptive summary sentences at the start of each
      section, are for convenience only and shall not affect the interpretation
      of this Agreement. If any provision of this Agreement shall be held by a
      court of competent jurisdiction to be unlawful, void, or unenforceable,
      then in such jurisdiction that provision shall be deemed severable from
      these terms and shall not affect the validity and enforceability of the
      remaining provisions.
    </p>
    <h2>29. Notices</h2>
    <p>
      MyHealthily may provide notice to you and obtain consent from you (1)
      through the Website (2) by electronic mail at the electronic mail address
      associated with your Account; and/or (3) by written mail communication to
      you at the address associated with your Account. You must submit all
      notices required or permitted under this Agreement to MyHealthily
      Insurance Solutions, LLC, c/o Compliance{' '}
      <span>
        Manager, Jeremy McClendon, 25 Rockwood Place, Suite 210, Englewood, NJ
        07631.
      </span>
    </p>
    <h2>
      30. No Responsibility for Acts or Omissions of Third Party Service
      Providers
    </h2>
    <p>
      MyHealthily may refer names of certain third party service providers,
      insurance carriers, rate and form vendors, product and technology vendors
      and brokers and agents (&ldquo;Service Providers&rdquo;) to you upon your
      request or in connection with the Service. Any Service Providers referred
      to You by MyHealthily are not owned or controlled by MyHealthily. You
      agree that MyHealthily is not responsible or liable in any way for the
      acts or omissions of any Service Providers, including, without limitation,
      any negligent, willful or illegal conduct. You further agree to conduct
      your own investigation and due diligence regarding any Service Providers
      referred to you by MyHealthily. You agree to defend (at
      MyHealthily&rsquo;s option), indemnify and hold harmless MyHealthily from
      all damages, liabilities, claims, expenses and losses relating to the
      referral of Service Providers to You.
    </p>
    <h2>31. Business Associate Agreement</h2>
    <p>
      For purposes of complying with the requirements of HIPAA to the extent
      applicable, You and MyHealthily agree to be bound by each of the terms and
      provisions of the MyHealthily Business Associate Agreement, which can be
      found at&nbsp;
      <a href="https://www.MyHealthily.com/baa">
        <span>https://www.MyHealthily.com/baa</span>
      </a>
      (the &ldquo;BAA&rdquo;) and which is incorporated in full by this
      reference. If any provision hereof is potentially or actually in conflict
      with the provisions of the Business Associate Agreement with respect to
      the treatment of Protected Health Information, the terms of the Business
      Associate Agreement shall prevail.
    </p>
    <h2>32. Consent to Electronic Communications</h2>
    <p>
      We provide Users information by email or posting through the Website. The
      emails and other communications You will receive include those relating to
      billing, account verification, platform and Service training (sometimes
      called &ldquo;on-boarding materials), survey requests (for product and
      customer service improvement purposes), marketing and promotions, and
      administrative announcements (including related to these Terms of Service,
      our Privacy Policy, or security incident notifications). You understand
      that by using the Service and agreeing to these Terms of Service,
      MyHealthily will send to you the foregoing communication types and You
      hereby waive any right to opt out of such communications to the extent
      permitted by applicable law.
    </p>
    <p>
      <span>For Brokers/Agents/Producers: </span>You are responsible for
      obtaining either requisite consent or ceasing email communication to any
      Client/Employer or Employee in the event that such Client/Employer or
      Employee opts out of receipt of any such communications.
    </p>
    <h2>33. Liability Insurance</h2>
    <p>
      <span>For Brokers/Agents/Producers: </span>You must maintain general
      liability, professional liability, and a minimum of $1,000,000 per
      occurrence in errors and omissions insurance or bonds in amounts and in
      forms standard and adequate for Your business and agreeable to{' '}
      <span>MyHealthily. </span> You must provide <span>MyHealthily</span> proof
      of insurance upon <span>MyHealthily</span>&rsquo;s request. You must
      immediately notify <span>MyHealthily</span> in writing if Your insurance
      terminates, is cancelled, suspended, or changes in a material way,
      including but not limited to a change in the amount of insurance.
    </p>
    <p>
      Our Copyright Agent for notice of claims of copyright infringement on or
      regarding this site can be reached as follows:
    </p>
    <p>
      Executive Counsel PLC, 2883 Macao Drive, Herndon VA 20171 Attn: Nelson
      Blitz<span>.</span>
    </p>
    <p>&nbsp;</p>
    <p>MyHealthily Terms of Service v2.1 September 2021</p>
  </>
)
/* eslint-enable */

const TermsAndConditionsText: React.FC<Props> = (props) => {
  useEffect(() => {
    if (props.scrollToSection) {
      const element = document.getElementById(
        `section-${props.scrollToSection}`
      )
      if (element) {
        element.scrollIntoView()
      }
    }
    // eslint-disable-next-line
  }, [])

  return <div {...props}>{TEXTOFTC}</div>
}

export default TermsAndConditionsText
