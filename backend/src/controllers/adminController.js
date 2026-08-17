import User from '../models/User.js';

export const getReviewPanelUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve review system data.', error: error.message });
  }
};

export const verifyArtist = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.status = 'active';
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account for ${user.name} is verified and activated.`,
      user: { id: user._id, status: user.status }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify user.', error: error.message });
  }
};

export const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Administrators cannot be suspended.' });

    user.status = 'suspended';
    await user.save();

    res.status(200).json({
      success: true,
      message: `${user.name} has been suspended for breaching TOS.`,
      user: { id: user._id, status: user.status }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to suspend account.', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Administrators cannot be deleted.' });

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `User account for ${user.name} was deleted permanently.`
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete account.', error: error.message });
  }
};