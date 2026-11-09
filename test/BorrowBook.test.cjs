const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BorrowBook Smart Contract Unit Tests", function () {
  let borrowBook;
  let lender;
  let borrower;
  let thirdParty;

  const sampleLoanId = ethers.encodeBytes32String("LOAN-001");
  const sampleLoanId2 = ethers.encodeBytes32String("LOAN-002");
  const itemName = "Clean Code Book";
  const itemDescription = "Hardcover edition in excellent condition";

  // Helper to get latest block timestamp
  async function getLatestTimestamp() {
    const block = await ethers.provider.getBlock("latest");
    return block.timestamp;
  }

  beforeEach(async function () {
    [lender, borrower, thirdParty] = await ethers.getSigners();

    const BorrowBookFactory = await ethers.getContractFactory("BorrowBook");
    borrowBook = await BorrowBookFactory.deploy();
    await borrowBook.waitForDeployment();
  });

  describe("1. Deployment", function () {
    it("should initialize with zero loans", async function () {
      expect(await borrowBook.getTotalLoansCount()).to.equal(0n);
      expect(await borrowBook.getAllLoanIds()).to.deep.equal([]);
    });
  });

  describe("2. Loan Creation (createLoan)", function () {
    it("should create a loan successfully and emit LoanCreated event", async function () {
      const currentTime = await getLatestTimestamp();
      const expectedReturnDate = currentTime + 86400 * 7;

      await expect(
        borrowBook
          .connect(lender)
          .createLoan(sampleLoanId, borrower.address, itemName, itemDescription, expectedReturnDate)
      )
        .to.emit(borrowBook, "LoanCreated")
        .withArgs(
          sampleLoanId,
          lender.address,
          borrower.address,
          itemName,
          itemDescription,
          expectedReturnDate,
          (ts) => ts > 0n
        );

      expect(await borrowBook.getTotalLoansCount()).to.equal(1n);

      const loan = await borrowBook.getLoan(sampleLoanId);
      expect(loan.lender).to.equal(lender.address);
      expect(loan.borrower).to.equal(borrower.address);
      expect(loan.status).to.equal(1); // LoanStatus.AwaitingBorrower
      expect(loan.itemName).to.equal(itemName);
      expect(loan.description).to.equal(itemDescription);
      expect(loan.expectedReturnDate).to.equal(BigInt(expectedReturnDate));
      expect(loan.returnedAt).to.equal(0n);
    });

    it("should reject creation with empty loan ID", async function () {
      const currentTime = await getLatestTimestamp();
      const expectedReturnDate = currentTime + 86400;

      await expect(
        borrowBook
          .connect(lender)
          .createLoan(ethers.ZeroHash, borrower.address, itemName, itemDescription, expectedReturnDate)
      ).to.be.revertedWithCustomError(borrowBook, "InvalidLoanId");
    });

    it("should reject duplicate loan ID", async function () {
      const currentTime = await getLatestTimestamp();
      const expectedReturnDate = currentTime + 86400;

      await borrowBook
        .connect(lender)
        .createLoan(sampleLoanId, borrower.address, itemName, itemDescription, expectedReturnDate);

      await expect(
        borrowBook
          .connect(lender)
          .createLoan(sampleLoanId, borrower.address, "Another Title", "Desc", expectedReturnDate + 100)
      ).to.be.revertedWithCustomError(borrowBook, "DuplicateLoanId");
    });

    it("should reject zero address borrower", async function () {
      const currentTime = await getLatestTimestamp();
      const expectedReturnDate = currentTime + 86400;

      await expect(
        borrowBook
          .connect(lender)
          .createLoan(sampleLoanId, ethers.ZeroAddress, itemName, itemDescription, expectedReturnDate)
      ).to.be.revertedWithCustomError(borrowBook, "InvalidBorrowerAddress");
    });

    it("should reject self-lending (lender == borrower)", async function () {
      const currentTime = await getLatestTimestamp();
      const expectedReturnDate = currentTime + 86400;

      await expect(
        borrowBook
          .connect(lender)
          .createLoan(sampleLoanId, lender.address, itemName, itemDescription, expectedReturnDate)
      ).to.be.revertedWithCustomError(borrowBook, "SelfLendingNotAllowed");
    });

    it("should reject empty item name", async function () {
      const currentTime = await getLatestTimestamp();
      const expectedReturnDate = currentTime + 86400;

      await expect(
        borrowBook
          .connect(lender)
          .createLoan(sampleLoanId, borrower.address, "", itemDescription, expectedReturnDate)
      ).to.be.revertedWithCustomError(borrowBook, "EmptyItemName");
    });

    it("should reject past or current return date", async function () {
      const currentTime = await getLatestTimestamp();

      await expect(
        borrowBook
          .connect(lender)
          .createLoan(sampleLoanId, borrower.address, itemName, itemDescription, currentTime)
      ).to.be.revertedWithCustomError(borrowBook, "InvalidExpectedReturnDate");
    });
  });

  describe("3. Borrowing Confirmation (confirmBorrowing)", function () {
    beforeEach(async function () {
      const currentTime = await getLatestTimestamp();
      await borrowBook
        .connect(lender)
        .createLoan(sampleLoanId, borrower.address, itemName, itemDescription, currentTime + 86400);
    });

    it("should allow designated borrower to confirm receipt", async function () {
      await expect(borrowBook.connect(borrower).confirmBorrowing(sampleLoanId))
        .to.emit(borrowBook, "BorrowingConfirmed")
        .withArgs(sampleLoanId, borrower.address, (ts) => ts > 0n);

      const loan = await borrowBook.getLoan(sampleLoanId);
      expect(loan.status).to.equal(2); // LoanStatus.Borrowed
    });

    it("should reject confirmation by lender or third party", async function () {
      await expect(borrowBook.connect(lender).confirmBorrowing(sampleLoanId)).to.be.revertedWithCustomError(
        borrowBook,
        "Unauthorized"
      );

      await expect(borrowBook.connect(thirdParty).confirmBorrowing(sampleLoanId)).to.be.revertedWithCustomError(
        borrowBook,
        "Unauthorized"
      );
    });

    it("should reject confirming non-existent loan", async function () {
      const fakeId = ethers.encodeBytes32String("FAKE-ID");
      await expect(borrowBook.connect(borrower).confirmBorrowing(fakeId)).to.be.revertedWithCustomError(
        borrowBook,
        "LoanDoesNotExist"
      );
    });

    it("should reject confirming an already borrowed loan", async function () {
      await borrowBook.connect(borrower).confirmBorrowing(sampleLoanId);

      await expect(borrowBook.connect(borrower).confirmBorrowing(sampleLoanId)).to.be.revertedWithCustomError(
        borrowBook,
        "InvalidStateTransition"
      );
    });
  });

  describe("4. Return Initiation (markReturned)", function () {
    beforeEach(async function () {
      const currentTime = await getLatestTimestamp();
      await borrowBook
        .connect(lender)
        .createLoan(sampleLoanId, borrower.address, itemName, itemDescription, currentTime + 86400);
    });

    it("should reject markReturned before borrower confirms receipt", async function () {
      await expect(borrowBook.connect(lender).markReturned(sampleLoanId)).to.be.revertedWithCustomError(
        borrowBook,
        "InvalidStateTransition"
      );
    });

    it("should allow lender to mark as returned once borrowed", async function () {
      await borrowBook.connect(borrower).confirmBorrowing(sampleLoanId);

      await expect(borrowBook.connect(lender).markReturned(sampleLoanId))
        .to.emit(borrowBook, "ReturnInitiated")
        .withArgs(sampleLoanId, lender.address, (ts) => ts > 0n);

      const loan = await borrowBook.getLoan(sampleLoanId);
      expect(loan.status).to.equal(3); // LoanStatus.ReturnPending
    });

    it("should reject markReturned from non-lender", async function () {
      await borrowBook.connect(borrower).confirmBorrowing(sampleLoanId);

      await expect(borrowBook.connect(borrower).markReturned(sampleLoanId)).to.be.revertedWithCustomError(
        borrowBook,
        "Unauthorized"
      );

      await expect(borrowBook.connect(thirdParty).markReturned(sampleLoanId)).to.be.revertedWithCustomError(
        borrowBook,
        "Unauthorized"
      );
    });
  });

  describe("5. Return Confirmation (confirmReturn)", function () {
    beforeEach(async function () {
      const currentTime = await getLatestTimestamp();
      await borrowBook
        .connect(lender)
        .createLoan(sampleLoanId, borrower.address, itemName, itemDescription, currentTime + 86400);
      await borrowBook.connect(borrower).confirmBorrowing(sampleLoanId);
    });

    it("should reject confirmReturn if return has not been initiated", async function () {
      await expect(borrowBook.connect(borrower).confirmReturn(sampleLoanId)).to.be.revertedWithCustomError(
        borrowBook,
        "InvalidStateTransition"
      );
    });

    it("should allow borrower to confirm return when ReturnPending", async function () {
      await borrowBook.connect(lender).markReturned(sampleLoanId);

      await expect(borrowBook.connect(borrower).confirmReturn(sampleLoanId))
        .to.emit(borrowBook, "ReturnConfirmed")
        .withArgs(sampleLoanId, borrower.address, (ts) => ts > 0n);

      const loan = await borrowBook.getLoan(sampleLoanId);
      expect(loan.status).to.equal(4); // LoanStatus.Returned
      expect(loan.returnedAt).to.be.gt(0n);
    });

    it("should reject confirmReturn by unauthorized party", async function () {
      await borrowBook.connect(lender).markReturned(sampleLoanId);

      await expect(borrowBook.connect(lender).confirmReturn(sampleLoanId)).to.be.revertedWithCustomError(
        borrowBook,
        "Unauthorized"
      );

      await expect(borrowBook.connect(thirdParty).confirmReturn(sampleLoanId)).to.be.revertedWithCustomError(
        borrowBook,
        "Unauthorized"
      );
    });

    it("should prevent returned loans from being reused or modified", async function () {
      await borrowBook.connect(lender).markReturned(sampleLoanId);
      await borrowBook.connect(borrower).confirmReturn(sampleLoanId);

      await expect(borrowBook.connect(borrower).confirmBorrowing(sampleLoanId)).to.be.revertedWithCustomError(
        borrowBook,
        "InvalidStateTransition"
      );

      await expect(borrowBook.connect(lender).markReturned(sampleLoanId)).to.be.revertedWithCustomError(
        borrowBook,
        "InvalidStateTransition"
      );

      await expect(borrowBook.connect(lender).cancelLoan(sampleLoanId)).to.be.revertedWithCustomError(
        borrowBook,
        "InvalidStateTransition"
      );
    });
  });

  describe("6. Loan Cancellation (cancelLoan)", function () {
    beforeEach(async function () {
      const currentTime = await getLatestTimestamp();
      await borrowBook
        .connect(lender)
        .createLoan(sampleLoanId, borrower.address, itemName, itemDescription, currentTime + 86400);
    });

    it("should allow lender to cancel unconfirmed loan", async function () {
      await expect(borrowBook.connect(lender).cancelLoan(sampleLoanId))
        .to.emit(borrowBook, "LoanCancelled")
        .withArgs(sampleLoanId, lender.address, (ts) => ts > 0n);

      const loan = await borrowBook.getLoan(sampleLoanId);
      expect(loan.status).to.equal(5); // LoanStatus.Cancelled
    });

    it("should reject cancellation by borrower or third party", async function () {
      await expect(borrowBook.connect(borrower).cancelLoan(sampleLoanId)).to.be.revertedWithCustomError(
        borrowBook,
        "Unauthorized"
      );

      await expect(borrowBook.connect(thirdParty).cancelLoan(sampleLoanId)).to.be.revertedWithCustomError(
        borrowBook,
        "Unauthorized"
      );
    });

    it("should reject cancellation after borrower has confirmed borrowing", async function () {
      await borrowBook.connect(borrower).confirmBorrowing(sampleLoanId);

      await expect(borrowBook.connect(lender).cancelLoan(sampleLoanId)).to.be.revertedWithCustomError(
        borrowBook,
        "InvalidStateTransition"
      );
    });

    it("should prevent cancelled loan from being confirmed", async function () {
      await borrowBook.connect(lender).cancelLoan(sampleLoanId);

      await expect(borrowBook.connect(borrower).confirmBorrowing(sampleLoanId)).to.be.revertedWithCustomError(
        borrowBook,
        "InvalidStateTransition"
      );
    });
  });

  describe("7. Index Tracking & Queries", function () {
    it("should track loans per lender and borrower", async function () {
      const currentTime = await getLatestTimestamp();

      await borrowBook
        .connect(lender)
        .createLoan(sampleLoanId, borrower.address, itemName, itemDescription, currentTime + 86400);

      await borrowBook
        .connect(lender)
        .createLoan(sampleLoanId2, thirdParty.address, "Item Two", "Desc Two", currentTime + 86400);

      const lenderLoans = await borrowBook.getLenderLoans(lender.address);
      expect(lenderLoans).to.deep.equal([sampleLoanId, sampleLoanId2]);

      const borrowerLoans = await borrowBook.getBorrowerLoans(borrower.address);
      expect(borrowerLoans).to.deep.equal([sampleLoanId]);

      const thirdPartyLoans = await borrowBook.getBorrowerLoans(thirdParty.address);
      expect(thirdPartyLoans).to.deep.equal([sampleLoanId2]);

      const allLoans = await borrowBook.getAllLoanIds();
      expect(allLoans).to.deep.equal([sampleLoanId, sampleLoanId2]);
    });
  });
});
