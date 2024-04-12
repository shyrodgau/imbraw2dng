<!-- SPDX-License-Identifier: 0BSD -->
# imbraw2dng - RAW �t�@�C���� [I'mBack<sup>&reg;</sup>&nbsp;35mm/MF](https://imback.eu) ���� DNG �ɕϊ����� - �N�C�b�N �X�^�[�g

����͏��p�T�|�[�g�̂Ȃ��t���[ �\�t�g�E�F�A ([0-clause BSD-License](LICENSE.txt)) �ł��B

���̑��̃h�L�������g: [������](https://shyrodgau.github.io/imbraw2dng/moredoc_ja)

�܂��� [�h�C�c���](https://shyrodgau.github.io/imbraw2dng/README_de)

������ "���� RAW" �t�@�C���ł͂Ȃ��A�J���[ �t�B���^�����O���{���ꂽ���ۂ̐��̃Z���T�[ �f�[�^�ł� (�c�O�Ȃ��� 8 �r�b�g�݂̂ł�...)�B

���̃T�C�g�́A�g�ѓd�b�A�v���̕����I�ȋ@�\ (�ꍇ�ɂ���Ă͂���ȏ�A�܂� RAW �̕\��) ���T�|�[�g�ł���悤�ɂȂ�܂����B

�����_�ł́A35mm ("Angle medium"��"small"��) ����� I'm Back MF (����) �̌��݂̃t�@�[���E�F�A�œ��삷��悤�ł��B MF �ł͂��ׂẴA���O���ݒ肪�J�o�[����Ă���킯�ł͂���܂���B
����炪�K�v�ŁA�����ł��菕���������ꍇ�́A���A�����������B

����A�C�f�A�́A[github ���|�W�g��](https://github.com/shyrodgau/imbraw2dng) �� "[���](https://github.com/shyrodgau/imbraw2dng/issues)" �܂��� "[�f�B�X�J�b�V����](https://github.com/shyrodgau/imbraw2dng/discussions)" �^�u 
�A�܂��� [Facebook �� I'm Back Users �O���[�v](https://www.facebook.com/groups/1212628099691211) �ŁB

## ��{ ;tldr

�ȉ��ł́A�R�s�[���� RAW �t�@�C���� DNG �`���ɕϊ����邱�Ƃɏœ_�𓖂Ă܂��B �u���E�U�Ŏg�p���邽�߂ɕK�v�ȃt�@�C���� 1 �����Anode.js �Ŏg�p���邽�߂ɕK�v�ȃt�@�C���� 1 �����ł��B

`.../IMBACK` �� ImB �� Micro SD �J�[�h��̃f�B���N�g���ŁAUSB (�f�o�C�X��� `��e�ʃX�g���[�W` ��I�����܂�) �o�R�ŃA�N�Z�X���邩�AMicro SD �J�[�h�� PC �܂��̓X�}�[�g�t�H���ɑ}�����邱�ƂŃA�N�Z�X�ł��܂��B

1. �u���E�U�� [imbraw2dng.html](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.html) ���J���܂��B `.../IMBACK/PHOTO` ����� `.../IMBACK/MOVIE` �t�H���_�[����t�@�C������t�B�[���h�Ƀh���b�O���܂��B [(�ڍ�)](https://shyrodgau.github.io/imbraw2dng/moredoc#usage)

1. ([imbraw2dng.html](https://raw.githubusercontent.com/shyrodgau/imbraw2dng/master/imbraw2dng.html) �� `.../IMBACK` �t�H���_�ɕۑ����A�J�[�h�����o������) 
PC �܂��̓X�}�[�g�t�H���� ImB WiFi �ɐڑ����A�u���E�U�� ImB ���� [http://192.168.1.254/IMBACK/imbraw2dng.html](http://192.168.1.254/IMBACK/imbraw2dng.html) ���J���܂��B
[(�ڍ�)](https://shyrodgau.github.io/imbraw2dng/moredoc#browsing-on-the-imback)

1. [imbraw2dng.js](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.js) ���_�E�����[�h���A `node imbraw2dng.js .../IMBACK` ���Ăяo���܂��B
[(�ڍ�)](https://shyrodgau.github.io/imbraw2dng/moredoc#command-line-using-nodejs)

1. PC �� ImB �� WiFi �ɐڑ����A [imbraw2dng.js](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.js) �_�E�����[�h���A`node imbraw2dng.js -R -J -O` ���Ăяo���܂��B
[(�ڍ�)](https://shyrodgau.github.io/imbraw2dng/moredoc#command-line-using-nodejs)


## DNG �̏���

����ɂ́Adarktable�Alightroom�Aufraw�Arawtherapee �Ȃǂ̂��C�ɓ���̃\�t�g�E�F�A���g�p���Ă��������B

�ʐ^�������ɂ��܂������Ƃ͊��� **���Ȃ�** �ł��������B�ׂẴv���O���������҂��邷�ׂĂ� DNG �Ɏ��߂邱�Ƃ͂ł������ɂ���܂���B 
���Ԃ������āA�K�؂ȐF���擾���Ă���A�c����s���Ă��������B *DNG �Ɋւ���o����������A�܂��͋��͂��Ă����l��m���Ă�����́A���A�����������B* 
�Ⴆ�΁ADarktable/RawSpeed �ɂ��Ă� [pixls.us �̃f�B�X�J�b�V����](https://discuss.pixls.us/t/converting-plain-raw-from-imback-to-dng/) �܂��́A 
[Facebook ��I'm Back �f�W�^�� �o�b�N�J���҃O���[�v](https://www.facebook.com/groups/2812057398929350) �ɖ߂��Ă��������B

�摜�ɋ����΂܂��̓}�[���^�̐F�������������邱�Ƃ͂Ȃ��Ȃ�܂��B �������A�J���[ �L�����u���[�V����/�J���[ �}�g���b�N�X/�z���C�g �o�����X�ŏ��� **�ł��Ȃ�** ���̂�����ꍇ�́A�T���v���摜�������[����������܂���B

**�F�ɂ��Ĉꌾ:** �F�ɂ��Ă͂܂������킩��܂���...

�摜�̒����ɐԂ��_������ꍇ�́A�蓮�Ń��^�b�`���邩�A�_�[�N�e�[�u���Ŏ��̐ݒ���g�p���āA���̎���Ɏ蓮�ŉ~��z�u����K�v������܂��B

�ŏ�����ԓ_�������ɂ́A���傫�ȍi�� (������ F �l) ���g�p���邩�A�ʏ�� PDLC �t�H�[�J�V���O �X�N���[���� I'm Back �̃t���l�� �X�N���[���܂��� Canon EG-xxx �t�H�[�J�V���O �X�N���[���ɐڑ����܂��B

![darktable sample agains red circle](https://shyrodgau.github.io/imbraw2dng/helpstuff/darktable_redcircle.png "darktable sample agains red circle")

