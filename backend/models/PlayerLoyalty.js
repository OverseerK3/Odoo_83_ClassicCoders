const mongoose = require('mongoose');

const PlayerLoyaltySchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true, index: true },
    bookingCount: { type: Number, default: 0 }, // Count of completed bookings at this venue
    totalBookings: { type: Number, default: 0 }, // Total bookings (including cancelled)
    lastBookingDate: { type: Date },
    discountCards: [{
      cardId: { type: String, required: true }, // Unique ID for each card
      discountPercentage: { type: Number, required: true }, // 35, 45, or 55
      isScratched: { type: Boolean, default: false },
      isUsed: { type: Boolean, default: false },
      earnedDate: { type: Date, default: Date.now },
      scratchedDate: { type: Date },
      usedDate: { type: Date },
      expiryDate: { type: Date }, // Cards expire after 6 months
    }],
    streakCount: { type: Number, default: 0 }, // Consecutive booking streaks
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Compound index for efficient queries
PlayerLoyaltySchema.index({ player: 1, venue: 1 }, { unique: true });
PlayerLoyaltySchema.index({ 'discountCards.cardId': 1 });

// Method to check if player qualifies for discount card
PlayerLoyaltySchema.methods.checkDiscountEligibility = function() {
  return this.bookingCount > 0 && this.bookingCount % 5 === 0;
};

// Method to generate new discount card
PlayerLoyaltySchema.methods.generateDiscountCard = function() {
  if (!this.checkDiscountEligibility()) {
    console.log(`No eligibility: ${this.bookingCount} bookings, not divisible by 5`);
    return null;
  }
  
  // Simple duplicate check - count existing cards vs expected cards
  const expectedCards = Math.floor(this.bookingCount / 5);
  const existingCards = this.discountCards.length;
  
  if (existingCards >= expectedCards) {
    console.log(`Card already exists: ${existingCards} cards for ${expectedCards} expected`);
    return null;
  }
  
  // Random discount between 35%, 45%, and 55%
  const discounts = [35, 45, 55];
  const randomDiscount = discounts[Math.floor(Math.random() * discounts.length)];
  
  const newCard = {
    cardId: `DC_${this.player}_${this.venue}_${Date.now()}_${this.bookingCount}`,
    discountPercentage: randomDiscount,
    isScratched: false,
    isUsed: false,
    earnedDate: new Date(),
    expiryDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000) // 6 months
  };
  
  this.discountCards.push(newCard);
  console.log(`Generated new ${randomDiscount}% discount card for ${this.bookingCount} bookings at venue ${this.venue}`);
  return newCard;
};

// Method to get available (unscratched/unused) cards
PlayerLoyaltySchema.methods.getAvailableCards = function() {
  return this.discountCards.filter(card => 
    !card.isUsed && 
    !card.isScratched && 
    new Date() < card.expiryDate
  );
};

// Method to get scratched but unused cards
PlayerLoyaltySchema.methods.getScratchedCards = function() {
  return this.discountCards.filter(card => 
    card.isScratched && 
    !card.isUsed && 
    new Date() < card.expiryDate
  );
};

module.exports = mongoose.model('PlayerLoyalty', PlayerLoyaltySchema);
