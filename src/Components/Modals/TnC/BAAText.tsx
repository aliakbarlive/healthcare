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
const TEXTOFBAA = (
  <>
    <h1>Business Associate Agreement</h1>

    <p>
      This Agreement (&ldquo;Agreement&rdquo;) is made and entered into at the
      date and time your My Healthily account is created and is between you
      (&ldquo;Covered Entity&rdquo;) and My Healthily Insurance Solutions, LLC
      (&ldquo;Business Associate&rdquo; or &ldquo;My Healthily&rdquo;), a
      Delaware limited liability company.
    </p>

    <p>
      WHEREAS, Business Associate is in the business of providing
      Licensedproviding Licensed Insurance Agent/Broker Services [specific
      description of offering ] (&ldquo;Offering&rdquo;); and
    </p>

    <p>
      WHEREAS, Covered Entity wishes to engage, or has engaged, Business
      Associate in connection with said Offering,
    </p>
    <p>
      NOW, THEREFORE, in consideration of the premises and mutual promises
      herein contained, it is agreed as follows:
    </p>
    <h2>1. Definitions.</h2>
    <p>
      Terms used, but not otherwise defined in this Agreement, shall have the
      same meaning as those terms in the Privacy Rule, Security Rule, and HITECH
      Act.
    </p>
    <ol>
      <li>
        Agent or Broker. &ldquo;Agent&rdquo; or &ldquo;Broker&rdquo; shall have
        the meaning as determined in accordance with the federal common law of
        agency.
        <br />
      </li>
      <li>
        Breach. &ldquo;Breach&rdquo; shall have the same meaning as the term
        &ldquo;breach&rdquo; in 45 CFR &sect;&nbsp;164.402.
        <br />
      </li>
      <li>
        Business Associate. &ldquo;Business Associate&rdquo; shall mean My
        Healthily Insurance Solutions, LLC.
        <br />
      </li>
      <li>
        Covered Entity. &ldquo;Covered Entity&rdquo; shall mean active user of
        My Healthily who registers for an account and agrees to the terms of
        service, and who is a &ldquo;covered entity&rdquo; as defined in 45 CFR
        &sect; 160.103.
        <br />
      </li>
      <li>
        Data Aggregation. &ldquo;Data Aggregation&rdquo; shall have the same
        meaning as the term &ldquo;data aggregation&rdquo; in 45 CFR &sect;
        164.501.
        <br />
      </li>
      <li>
        Designated Record Set. &ldquo;Designated Record Set&rdquo; shall have
        the same meaning as the term &ldquo;designated record set&rdquo; in 45
        CFR &sect; 164.501.
        <br />
      </li>
      <li>
        Disclosure. &ldquo;Disclosure&rdquo; and &ldquo;Disclose&rdquo; shall
        have the same meaning as the term &ldquo;Disclosure&rdquo; in 45 CFR
        &sect; 160.103.
        <br />
      </li>
      <li>
        Electronic Health Record. &ldquo;Electronic Health Record&rdquo; shall
        have the same meaning as the term in Section 13400 of the HITECH Act.
        <br />
      </li>
      <li>
        Health Care Operations. &ldquo;Health Care Operations&rdquo; shall have
        the same meaning as the term &ldquo;health care operations&rdquo; in 45
        CFR &sect; 164.501.
        <br />
      </li>
      <li>
        HIPAA Rules. &ldquo;HIPAA Rules&rdquo; shall mean the Privacy, Security,
        Breach Notification, and Enforcement Rules at 45 CFR Part 160 and Part
        164.
        <br />
      </li>
      <li>
        HITECH Act. &ldquo;HITECH Act&rdquo; shall mean The Health Information
        Technology for Economic and Clinical Health Act, part of the American
        Recovery and Reinvestment Act of 2009 (&ldquo;ARRA&rdquo; or
        &ldquo;Stimulus Package&rdquo;), specifically DIVISION A: TITLE XIII
        Subtitle D&mdash;Privacy, and its corresponding regulations as enacted
        under the authority of the Act.
        <br />
      </li>
      <li>
        Individual. &ldquo;Individual&rdquo; shall have the same meaning as the
        term &ldquo;individual&rdquo; in 45 CFR &sect; 160.103 and shall include
        a person who qualifies as a personal representative in accordance with
        45 CFR &sect; 164.502(g).
        <br />
      </li>
      <li>
        Minimum Necessary. &ldquo;Minimum Necessary&rdquo; shall mean the
        Privacy Rule Standards found at &sect;164.502(b) and &sect;
        164.514(d)(1).
        <br />
      </li>
      <li>
        Privacy Rule. &ldquo;Privacy Rule&rdquo; shall mean the Standards for
        Privacy of Individually Identifiable Health Information at 45 CFR Part
        160 and Part 164, Subparts A and E.
        <br />
      </li>
      <li>
        Protected Health Information. &ldquo;Protected Health Information&rdquo;
        shall have the same meaning as the term &ldquo;protected health
        information&rdquo; in 45 CFR &sect; 160.103, limited to the information
        created, received, maintained or transmitted by Business Associate on
        behalf of Covered Entity.
        <br />
      </li>
      <li>
        Required By Law. &ldquo;Required By Law&rdquo; shall have the same
        meaning as the term &ldquo;required by law&rdquo; in 45 CFR &sect;
        164.103.
        <br />
      </li>
      <li>
        Secretary. &ldquo;Secretary&rdquo; shall mean the Secretary of the
        Department of Health and Human Services or his or her designee.
        <br />
      </li>
      <li>
        Security Incident. &ldquo;Security Incident&rdquo; shall have the same
        meaning as the term &ldquo;Security Incident&rdquo; in 45 CFR &sect;
        164.304.
        <br />
      </li>
      <li>
        Security Rule. &ldquo;Security Rule&rdquo; shall mean the Standards for
        Security of Electronic Protected Health Information at 45 C.F.R. parts
        &sect; 160 and &sect; 164, Subparts A and C.
        <br />
      </li>
      <li>
        Subcontractor. &ldquo;Subcontractor&rdquo; shall mean a person or entity
        &ldquo;that creates, receives, maintains, or transmits protected health
        information on behalf of a business associate&rdquo; and who is now
        considered a business associate, as the latter term is defined in 45 CFR
        &sect; 160.103.
        <br />
      </li>
      <li>
        Subject Matter. &ldquo;Subject Matter&rdquo; shall mean compliance with
        the HIPAA Rules and with the HITECH Act.
        <br />
      </li>
      <li>
        Unsecured Protected Health Information. &ldquo;Unsecured Protected
        Health Information&rdquo; shall have the same meaning as the term
        &ldquo;unsecured protected health information&rdquo; in 45 CFR &sect;
        164.402.
        <br />
      </li>
      <li>
        Use. &ldquo;Use&rdquo; shall have the same meaning as the term
        &ldquo;Use&rdquo; in 45 CFR &sect; 164.103.
        <br />
      </li>
    </ol>
    <h2>2. Obligations and Activities of Business Associate.</h2>
    <ol>
      <li>
        Business Associate agrees to not Use or Disclose Protected Health
        Information other than as permitted or required by this Agreement or as
        Required By Law.
        <br />
      </li>
      <li>
        Business Associate agrees to use appropriate safeguards to prevent Use
        or Disclosure of Protected Health Information other than as provided for
        by this Agreement. Business Associate further agrees to implement
        administrative, physical and technical safeguards that reasonably and
        appropriately protect the confidentiality, integrity and availability of
        any electronic Protected Health Information, as provided for in the
        Security Rule and as mandated by Section 13401 of the HITECH Act.
        <br />
      </li>
      <li>
        Business Associate agrees to mitigate, to the extent practicable, any
        harmful effect that is known to Business Associate of a Use or
        Disclosure of Protected Health Information by Business Associate in
        violation of the requirements of this Agreement. Business Associate
        further agrees to report to Covered Entity any Use or Disclosure of
        Protected Health Information not provided for by this Agreement of which
        it becomes aware, and in a manner as prescribed herein.
        <br />
      </li>
      <li>
        If the Breach, as discussed in paragraph 2(c), pertains to Unsecured
        Protected Health Information, then Business Associate agrees to report
        any such data Breach to Covered Entity within ten (10) business days of
        discovery of said Breach; all other compromises of Protected Health
        Information shall be reported to Covered Entity within twenty (20)
        business days of discovery. Business Associate further agrees,
        consistent with Section 13402 of the HITECH Act, to provide Covered
        Entity, via email or phone call, with information necessary for Covered
        Entity to meet the requirements of said section.
        <br />
      </li>
      <li>
        If Business Associate is an Agent of Covered Entity, then Business
        Associate agrees that any Breach of Unsecured Protected Health
        Information shall be reported to Covered Entity immediately promptly
        after the Business Associate becomes aware of said Breach, and under no
        circumstances later than one (1) business day thereafter. Business
        Associate further agrees that any compromise of Protected Health
        Information, other than a Breach of Unsecured Protected Health
        Information as specified in 2(c) of this Agreement, shall be reported to
        Covered Entity within ten (10) business days of discovering said
        compromise, or attempted compromise.
        <br />
      </li>
      <li>
        Business Associate agrees to ensure that any Subcontractor, to whom
        Business Associate provides Protected Health Information, agrees to the
        same restrictions and conditions that apply through this Agreement to
        Business Associate with respect to such information. Business Associate
        further agrees that restrictions and conditions analogous to those
        contained herein shall be imposed on said Subcontractors via a written
        agreement that complies with all the requirements specified in &sect;
        164.504(e)(2), and that Business Associate shall only provide said
        Subcontractors Protected Health Information consistent with Section
        13405(b) of the HITECH Act. Further, Business Associate agrees to
        provide copies of said written agreements to Covered Entity within ten
        (10) business days of a Covered Entity&rsquo;s request for same.
        <br />
      </li>
      <li>
        Business Associate agrees to provide access via in-app export, to
        Protected Health Information in a Designated Record Set to Covered
        Entity or, as directed by Covered Entity, to an Individual, in order to
        meet Covered Entity&rsquo;s requirements under 45 CFR &sect; 164.524.
        Business Associate further agrees, in the case where Business Associate
        controls access to Protected Health Information in an Electronic Health
        Record, or controls access to Protected Health Information stored
        electronically in any format, to provide similar access in order for
        Covered Entity to meet its requirements of the HIPAA Rules and under
        Section 13405(c) of the HITECH Act. These provisions do not apply if
        Business Associate and its employees or Subcontractors have no Protected
        Health Information in a Designated Record Set of Covered Entity.
        <br />
      </li>
      <li>
        Business Associate agrees to make Protected Health Information in a
        Designated Record Set available to the Covered Entity for the purpose of
        making amendments and incorporate such amendments in the Designated
        Record Set pursuant to 45 CFR &sect;164.526. This provision does not
        apply if Business Associate and its employees or Subcontractors have no
        Protected Health Information from a Designated Record Set of Covered
        Entity.
        <br />
      </li>
      <li>
        Unless otherwise protected or prohibited from discovery or disclosure by
        law, Business Associate agrees to make internal practices, books, and
        records, including policies and procedures (collectively
        &ldquo;Compliance Information&rdquo;), relating to the Use or Disclosure
        of Protected Health Information and the protection of same, available to
        the Covered Entity or to the Secretary for purposes of the Secretary
        determining Covered Entity&rsquo;s compliance with the HIPAA Rules and
        the HITECH Act. Business Associate further agrees, at the request of
        Covered Entity, to provide Covered Entity with demonstrable evidence
        that its Compliance Information ensures Business Associate&rsquo;s
        compliance with this Agreement over time. Business Associate shall have
        a reasonable time within which to comply with requests for such access
        and/or demonstrable evidence, consistent with this Agreement. In no case
        shall access, or demonstrable evidence, be required in less than ten
        (10) business days after Business Associate&rsquo;s receipt of such
        request, unless otherwise designated by the Secretary.
        <br />
      </li>
      <li>
        Business Associate agrees to maintain necessary and sufficient
        documentation of Disclosures of Protected Health Information as would be
        required for Covered Entity to respond to a request by an Individual for
        an accounting of such Disclosures, in accordance with 45 CFR
        &sect;164.528.
        <br />
      </li>
      <li>
        On request of Covered Entity, Business Associate agrees to provide to
        Covered Entity documentation made in accordance with this Agreement to
        permit Covered Entity to respond to a request by an Individual for an
        accounting of disclosures of Protected Health Information in accordance
        with 45 C.F.R. &sect; 164.528. Business Associate shall provide said
        documentation in a manner and format to be specified by Covered Entity.
        Business Associate shall have a reasonable time within which to comply
        with such a request from Covered Entity and in no case shall Business
        Associate be required to provide such documentation in less than five
        (5) business days after Business Associate&rsquo;s receipt of such
        request.
        <br />
      </li>
      <li>
        Except as provided for in this Agreement, in the event Business
        Associate receives an access, amendment, accounting of disclosure, or
        other similar request directly from an Individual, Business Associate
        shall redirect the Individual to the Covered Entity.
        <br />
      </li>
      <li>
        To the extent that Business Associate carries out one or more of Covered
        Entity&rsquo;s obligations under the HIPAA Rules, the Business Associate
        must comply with all requirements of the HIPAA Rules that would be
        applicable to the Covered Entity.
        <br />
      </li>
      <li>
        A Business Associate must honor all restrictions consistent with 45
        C.F.R. &sect;&nbsp;164.522 that the Covered Entity or the Individual
        makes the Business Associate aware of, including the Individual&rsquo;s
        right to restrict certain disclosures of protected health information to
        a health plan where the individual pays out of pocket in full for the
        healthcare item or service, in accordance with HITECH Act Section
        13405(a).
        <br />
      </li>
    </ol>
    <h2>3. Permitted Uses and Disclosures by Business Associate.</h2>
    <ol>
      <li>
        Except as otherwise limited by this Agreement, Business Associate may
        make any Uses and Disclosures of Protected Health Information necessary
        to perform its services to Covered Entity and otherwise meet its
        obligations under this Agreement, if such Use or Disclosure would not
        violate the Privacy Rule, or the privacy provisions of the HITECH Act,
        if done by Covered Entity. All other Uses or Disclosures by Business
        Associate not authorized by this Agreement, or by specific instruction
        of Covered Entity, are prohibited.
        <br />
      </li>
      <li>
        Except as otherwise limited in this Agreement, Business Associate may
        Use Protected Health Information for the proper management and
        administration of the Business Associate or to carry out the legal
        responsibilities of the Business Associate.
        <br />
      </li>
      <li>
        Except as otherwise limited in this Agreement, Business Associate may
        Disclose Protected Health Information for the proper management and
        administration of the Business Associate, provided that Disclosures are
        Required By Law, or Business Associate obtains reasonable assurances
        from the person to whom the information is Disclosed that it will remain
        confidential and used, or further Disclosed, only as Required By Law, or
        for the purpose for which it was Disclosed to the person, and the person
        notifies the Business Associate of any instances of which it is aware in
        which the confidentiality of the information has been breached.
        <br />
      </li>
      <li>
        Except as otherwise limited in this Agreement, Business Associate may
        Use Protected Health Information to provide Data Aggregation services to
        Covered Entity as permitted by 45 CFR &sect;164.504(e)(2)(i)(B).
        Business Associate agrees that such Data Aggregation services shall be
        provided to Covered Entity only wherein said services pertain to Health
        Care Operations. Business Associate further agrees that said services
        shall not be provided in a manner that would result in Disclosure of
        Protected Health Information to another covered entity who was not the
        originator and/or lawful possessor of said Protected Health Information.
        Further, Business Associate agrees that any such wrongful Disclosure of
        Protected Health Information is a direct violation of this Agreement and
        shall be reported to Covered Entity immediately after the Business
        Associate becomes aware of said Disclosure and, under no circumstances,
        later than three (3) business days thereafter.
        <br />
      </li>
      <li>
        Business Associate may Use Protected Health Information to report
        violations of law to appropriate Federal and State authorities,
        consistent with &sect; 164.502(j)(1).
        <br />
      </li>
      <li>
        Business Associate shall make Uses, Disclosures, and requests for
        Protected Health Information consistent with the Minimum Necessary
        principle as defined herein.
        <br />
      </li>
    </ol>
    <h2>4. Obligations and Activities of Covered Entity.</h2>
    <ol>
      <li>
        Covered Entity shall notify Business Associate of the provisions and any
        limitation(s) in its notice of privacy practices of Covered Entity in
        accordance with 45 CFR &sect; 164.520, to the extent that such
        provisions and limitation(s) may affect Business Associate&rsquo;s Use
        or Disclosure of Protected Health Information.
        <br />
      </li>
      <li>
        Covered Entity shall notify Business Associate of any changes in, or
        revocation of, permission by an Individual to use or disclose Protected
        Health Information, to the extent that the changes or revocation may
        affect Business Associate&rsquo;s use or disclosure of Protected Health
        Information.
        <br />
      </li>
      <li>
        Covered Entity shall notify Business Associate of any restriction to the
        use or disclosure of Protected Health Information that Covered Entity
        has agreed to in accordance with 45 CFR &sect;164.522, and also notify
        Business Associate regarding restrictions that must be honored under
        section 13405(a) of the HITECH Act, to the extent that such restrictions
        may affect Business Associate&rsquo;s Use or Disclosure of Protected
        Health Information.
        <br />
      </li>
      <li>
        Covered Entity shall notify Business Associate of any modifications to
        accounting disclosures of Protected Health Information under 45 CFR
        &sect; 164.528, made applicable under Section 13405(c) of the HITECH
        Act, to the extent that such restrictions may affect Business
        Associate&rsquo;s use or disclosure of Protected Health Information.
        <br />
      </li>
      <li>
        Business Associate shall provide information to Covered Entity via email
        or phone call, wherein such information is required to be provided to
        Covered Entity as agreed to by Business Associate in paragraph 2(d) of
        this Agreement. Covered Entity reserves the right to modify the manner
        and format in which said information is provided to Covered Entity, as
        long as the requested modification is reasonably required by Covered
        Entity to comply with the HIPAA Rules or the HITECH Act, and Business
        Associate is provided sixty (60) business days notice before the
        requested modification takes effect.
        <br />
      </li>
      <li>
        Covered Entity shall not require Business Associate to Use or Disclose
        Protected Health Information in any manner that would not be permissible
        under the HIPAA Rules if done by the Covered Entity.
        <br />
      </li>
    </ol>
    <h2>5. Term and Termination.</h2>
    <ol>
      <li>
        Term. The Term of this Agreement shall be effective as of the date and
        time Covered Entity agrees to the Terms of Service for using My
        Healthily&rsquo;s Website, Software, and Services by creating an
        account, and shall terminate when all of the Protected Health
        Information provided by Covered Entity to Business Associate, or created
        or received by Business Associate on behalf of Covered Entity, is
        destroyed or returned to Covered Entity, or, if it is infeasible to
        return or destroy Protected Health Information, protections are extended
        to such information, in accordance with the termination provisions in
        this Agreement.
        <br />
      </li>
      <li>
        Termination for Cause by Covered Entity. Upon Covered Entity&rsquo;s
        knowledge of a material breach of this Agreement by Business Associate,
        Covered Entity shall give Business Associate written notice of such
        breach and provide reasonable opportunity for Business Associate to cure
        the breach or end the violation. Covered Entity may terminate this
        Agreement, and Business Associate agrees to such termination, if
        Business Associate has breached a material term of this Agreement and
        does not cure the breach or cure is not possible. If neither termination
        nor cure is feasible, Covered Entity shall report the violation to the
        Secretary.
        <br />
      </li>
      <li>
        Termination for Cause by Business Associate. Upon Business
        Associate&rsquo;s knowledge of a material breach of this Agreement by
        Covered Entity, Business Associate shall give Covered Entity notice via
        email of such breach and provide reasonable opportunity for Covered
        Entity to cure the breach or end the violation. Business Associate may
        terminate this Agreement, and Covered Entity agrees to such termination,
        if Covered Entity has breached a material term of this Agreement and
        does not cure the breach or cure is not possible. If neither termination
        nor cure is feasible, Business Associate shall report the violation to
        the Secretary.
        <br />
      </li>
      <li>
        Effect of Termination.
        <ol>
          <li>
            Except as provided in paragraph (2) of this section, upon
            termination of this Agreement for any reason, Business Associate
            shall return or destroy all Protected Health Information received
            from, or created or received by Business Associate on behalf of
            Covered Entity. This provision shall also apply to Protected Health
            Information that is in the possession of Subcontractors of Business
            Associate. Business Associate shall retain no copies of the
            Protected Health Information.
            <br />
          </li>
          <li>
            In the event that Business Associate determines that returning or
            destroying the Protected Health Information is infeasible, Business
            Associate shall provide to Covered Entity, within ten (10) business
            days, notification of the conditions that make return or destruction
            infeasible. Upon such determination, Business Associate shall extend
            the protections of this Agreement to such Protected Health
            Information and limit further uses and disclosures of such Protected
            Health Information to those purposes that make the return or
            destruction infeasible, for so long as Business Associate maintains
            such Protected Health Information.
            <br />
          </li>
        </ol>
      </li>
    </ol>
    <h2>6. Entire Agreement.</h2>
    <ol>
      <li>
        This Agreement may be modified only by a signed written agreement
        between Covered Entity and Business Associate.
        <br />
      </li>
      <li>
        All other agreements entered into between Covered Entity and Business
        Associate, not related to this Subject Matter, remain in full force and
        effect.
        <br />
      </li>
    </ol>
    <h2>7. Governing Law &amp; Dispute Resolution.</h2>
    <ol>
      <li>
        This Agreement and the rights of the parties shall be governed by and
        construed in accordance with the Federal Arbitration Act, Federal law as
        it pertains to the Subject Matter, and shall be governed by and
        construed in accordance with the laws of the State of New Jersey as it
        pertains to contract formation and interpretation, without giving effect
        to its conflict of laws.
        <br />
      </li>
      <li>
        In the event of a Dispute between you and My Healthily (including any
        dispute over the validity, enforceability, or scope of this dispute
        resolution provision), other than with respect to claims for injunctive
        relief, the Dispute will be resolved by binding arbitration pursuant to
        the rules of the American Arbitration Association Commercial Arbitration
        Rules. The place of the arbitration shall be in Los Angeles, California.
        In the event that there is any Dispute between you and My Healthily that
        is determined not to be subject to arbitration pursuant to the preceding
        sentence, you agree to submit in that event to the exclusive
        jurisdiction and venue of the state and federal courts located in the
        County of Bergen, New Jersey.
        <br />
      </li>
    </ol>
    <h2>8. Miscellaneous.</h2>
    <ol>
      <li>
        Regulatory References. A reference in this Agreement to a section in the
        Privacy Rule, Security Rule, or HITECH Act means the section as in
        effect or as amended.
        <br />
      </li>
      <li>
        Amendment. The Parties agree to take such action as is necessary to
        amend this Agreement from time to time as is necessary for Covered
        Entity and Business Associate to comply with the requirements of the
        Privacy Rule, Security Rule, the Health Insurance Portability and
        Accountability Act of 1996 (Pub. L. No. 104-191), and the HITECH Act and
        its corresponding regulations.
        <br />
      </li>
      <li>
        Survival. The respective rights and obligations of Business Associate
        under Section 5(d) of this Agreement shall survive the termination of
        this Agreement.
        <br />
      </li>
      <li>
        Interpretation. Any ambiguity in this Agreement shall be resolved to
        permit Covered Entity and Business Associate to comply with the Privacy
        Rule, Security Rule, the Health Insurance Portability and Accountability
        Act of 1996 (Pub. L. No. 104-191), and the HITECH Act and its
        corresponding regulations.
        <br />
      </li>
      <li>
        Severability. If any provision or provisions of this Agreement is/are
        determined by a court of competent jurisdiction to be unlawful, void, or
        unenforceable, this Agreement shall not be unlawful, void or
        unenforceable thereby, but shall continue in effect and be enforced as
        though such provision or provisions were omitted.
        <br />
      </li>
    </ol>
  </>
)
/* eslint-enable */

const BAAText: React.FC<Props> = (props) => {
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

  return <div {...props}>{TEXTOFBAA}</div>
}

export default BAAText
